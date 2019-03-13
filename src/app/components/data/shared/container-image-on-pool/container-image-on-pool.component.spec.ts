import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectModule } from "@batch-flask/ui";
import { NcjTemplateMode } from "app/models";
import { RenderApplication, RenderEngine } from "app/models/rendering-container-image";
import { PoolService, RenderingContainerImageService } from "app/services";
import { BehaviorSubject, of } from "rxjs";
import { GithubDataServiceMock } from "test/utils/mocks";
import { ContainerImageOnPoolComponent } from "./container-image-on-pool.component";

@Component({
    template: `
        <bl-container-image-on-pool
            [formControl]="control"
            [formControl]="appVersionControl" [formControl]="rendererVersionControl"
            [app]="app" [renderEngine]="renderEngine" [imageReferenceId]="imageReferenceId"
            [poolId]="poolId" [poolContainerImage]="poolContainerImage"
            [ncjTemplateMode]="ncjTemplateMode">
        </bl-container-image-on-pool>
    `,
})

class TestComponent {
    public appVersionControl = new FormControl(null);
    public rendererVersionControl = new FormControl(null);

    public app: RenderApplication;
    public renderEngine: RenderEngine;
    public imageReferenceId: string;
    public poolId: string;
    public poolContainerImage: string;
    public ncjTemplateMode: NcjTemplateMode;
    public control = new FormControl(null);
}

const poolSingleValid = {
    id: "poolSingleValid",
    virtualMachineConfiguration: {
        containerConfiguration: {
            containerImageNames: [
                "ubuntu_maya2017u5_arnold2011",
            ],
        },
    },
};

const poolMultipleValid = {
    id: "poolMultipleValid",
    virtualMachineConfiguration: {
        containerConfiguration: {
            containerImageNames: [
                "ubuntu_maya2018u2_arnold2011",
                "ubuntu_maya2018u2_arnold2023",
            ],
        },
    },
};

const poolSecondValid = {
    id: "poolSecondValid",
    virtualMachineConfiguration: {
        containerConfiguration: {
            containerImageNames: [
                "win_maya2017_vray",
                "ubuntu_maya2018u3_arnold3101",
            ],
        },
    },
};

const poolMultipleInvalid = {
    id: "poolMultipleInvalid",
    virtualMachineConfiguration: {
        containerConfiguration: {
            containerImageNames: [
                "win_maya2017_vray",
                "ubuntu_3dsmax_vray",
            ],
        },
    },
};

describe("ContainerImageOnPoolComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let renderingContainerImageServiceSpy;
    let poolServiceSpy;

    const poolServiceReturned = new BehaviorSubject(poolSingleValid);

    beforeEach(() => {
        poolServiceSpy = {
            get: jasmine.createSpy("get").and.returnValue(poolServiceReturned),
        };

        renderingContainerImageServiceSpy = {
            containerImagesAsMap: jasmine.createSpy("containerImagesAsMap").and.returnValue(of(
                new GithubDataServiceMock().asContainerImageMap())),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, FormModule, ReactiveFormsModule, SelectModule, I18nTestingModule],
            declarations: [ContainerImageOnPoolComponent, TestComponent],
            providers: [
                { provide: RenderingContainerImageService, useValue: renderingContainerImageServiceSpy },
                { provide: PoolService, useValue: poolServiceSpy},
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.app = RenderApplication.Maya;
        testComponent.renderEngine = RenderEngine.Arnold;
        testComponent.imageReferenceId = "ubuntu-1604lts-container";
        testComponent.poolContainerImage = null;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css("bl-container-image-on-pool"));
    });

    describe("If ncjTemplateMode is ExistingPoolAndJob", () => {
        beforeEach(() => {
            testComponent.ncjTemplateMode = NcjTemplateMode.ExistingPoolAndJob;
        });

        it("no containerImage is displayed", () => {
            fixture.detectChanges();
            expect(de.query(By.css(".container-image-display"))).toEqual(null);
        });

        it("controls and form value are set correctly for a pool with a single containerImage", () => {
            testComponent.poolId = poolSingleValid.id;
            fixture.detectChanges();

            const appVersionInput = de.query(By.css("input")).nativeElement;
            const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;

            expect(appVersionInput.value).toEqual("2017-Update5");
            expect(rendererVersionInput.value).toEqual("2.0.1.1");

            expect(de.query(By.css(".container-image-display"))
                .nativeElement.textContent).toContain("ubuntu_maya2017u5_arnold2011");

            expect(testComponent.control.value).toEqual("ubuntu_maya2017u5_arnold2011");
        });

        it("if there are multiple valid containerImages, the first is used", () => {
            poolServiceReturned.next(poolMultipleValid);
            testComponent.poolId = poolMultipleValid.id;
            fixture.detectChanges();

            const appVersionInput = de.query(By.css("input")).nativeElement;
            const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;

            expect(appVersionInput.value).toEqual("2018-Update2");
            expect(rendererVersionInput.value).toEqual("2.0.1.1");

            expect(de.query(By.css(".container-image-display"))
                .nativeElement.textContent).toContain("ubuntu_maya2018u2_arnold2011");

            expect(testComponent.control.value).toEqual("ubuntu_maya2018u2_arnold2011");
        });

        it("if there are valid and invalid containerImages, the valid one is used", () => {
            poolServiceReturned.next(poolSecondValid);
            testComponent.poolId = poolSecondValid.id;
            fixture.detectChanges();

            const appVersionInput = de.query(By.css("input")).nativeElement;
            const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;

            expect(appVersionInput.value).toEqual("2018-Update3");
            expect(rendererVersionInput.value).toEqual("3.1.0.1");

            expect(de.query(By.css(".container-image-display"))
                .nativeElement.textContent).toContain("ubuntu_maya2018u3_arnold3101");

            expect(testComponent.control.value).toEqual("ubuntu_maya2018u3_arnold3101");
        });

        it("if there are no valid containerImages, app and render version are left empty", () => {
            testComponent.poolId = poolMultipleInvalid.id;
            poolServiceReturned.next(poolMultipleInvalid);
            fixture.detectChanges();

            const appVersionInput = de.query(By.css("input")).nativeElement;
            const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;

            expect(appVersionInput.value).toEqual("");
            expect(rendererVersionInput.value).toEqual("");

            expect(de.query(By.css(".container-image-display"))).toEqual(null);

            expect(testComponent.control.value).toEqual(null);
        });
    });

    describe("If ncjTemplateMode is NewPoolAndJob", () => {
        beforeEach(() => {
            testComponent.ncjTemplateMode = NcjTemplateMode.NewPoolAndJob;
        });

        it("no containerImage is displayed", () => {
            expect(de.query(By.css(".container-image-display"))).toEqual(null);
        });

        it("if poolContainerImage is set, containerImage is set, and version controls aren't displayed", () => {
            testComponent.poolContainerImage = "poolContainerImageValue";
            fixture.detectChanges();

            expect(de.query(By.css("input"))).toEqual(null);
            expect(de.queryAll(By.css("input"))[1]).toBeUndefined();

            expect(de.query(By.css(".container-image-display"))).toEqual(null);

            expect(testComponent.control.value).toEqual("poolContainerImageValue");
        });
    });
});
