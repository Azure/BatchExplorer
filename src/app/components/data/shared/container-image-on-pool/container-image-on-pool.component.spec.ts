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
        <bl-container-image-on-pool [formControl]="appVersionControl" [formControl]="rendererVersionControl"
            [app]="app" [renderEngine]="renderEngine" [imageReferenceId]="imageReferenceId"
            [poolId]="poolId" [ncjTemplateMode]="ncjTemplateMode">
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
    public ncjTemplateMode: NcjTemplateMode;
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
                "win_maya_vray",
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
                "win_maya_vray",
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
        testComponent.ncjTemplateMode = NcjTemplateMode.ExistingPoolAndJob;
        de = fixture.debugElement.query(By.css("bl-container-image-on-pool"));
    });

    it("for a pool with a single containerImage, shows the app and renderer version present on the pool", () => {
        const appVersionInput = de.query(By.css("input")).nativeElement;
        const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;
        testComponent.poolId = poolSingleValid.id;
        fixture.detectChanges();

        expect(appVersionInput.value).toEqual("2017-Update5");
        expect(rendererVersionInput.value).toEqual("2.0.1.1");
    });

    it("if there are multiple valid containerImages, the first is used", () => {
        const appVersionInput = de.query(By.css("input")).nativeElement;
        const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;
        testComponent.poolId = poolMultipleValid.id;
        poolServiceReturned.next(poolMultipleValid);
        fixture.detectChanges();

        expect(appVersionInput.value).toEqual("2018-Update2");
        expect(rendererVersionInput.value).toEqual("2.0.1.1");
    });

    it("if there are valid and invalid containerImages, the valid one is used", () => {
        const appVersionInput = de.query(By.css("input")).nativeElement;
        const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;
        testComponent.poolId = poolSecondValid.id;
        poolServiceReturned.next(poolSecondValid);
        fixture.detectChanges();

        expect(appVersionInput.value).toEqual("2018-Update3");
        expect(rendererVersionInput.value).toEqual("3.1.0.1");
    });

    it("if there are no valid containerImages, app and render version are left empty", () => {
        const appVersionInput = de.query(By.css("input")).nativeElement;
        const rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;
        testComponent.poolId = poolMultipleInvalid.id;
        poolServiceReturned.next(poolMultipleInvalid);
        fixture.detectChanges();

        expect(appVersionInput.value).toEqual("");
        expect(rendererVersionInput.value).toEqual("");
    });
});
