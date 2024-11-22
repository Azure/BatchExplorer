import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectModule } from "@batch-flask/ui";
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
            [poolId]="poolId" [poolContainerImage]="poolContainerImage">
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

    it("should create", () => {
        expect(de).toBeTruthy();
    });

    it("should display the correct app and render engine", () => {
        expect(de.componentInstance.appDisplay).toBe("Maya");
        expect(de.componentInstance.renderEngineDisplay).toBe("Arnold");
    });

    it("should update container image when poolId changes", () => {
        testComponent.poolId = "poolMultipleValid";
        poolServiceReturned.next(poolMultipleValid);
        fixture.detectChanges();

        expect(de.componentInstance.containerImage).toBe("ubuntu_maya2018u2_arnold2011");
    });

    it("should not update container image if no matching image is found", () => {
        testComponent.poolId = "poolMultipleInvalid";
        poolServiceReturned.next(poolMultipleInvalid);
        fixture.detectChanges();

        expect(de.componentInstance.containerImage).toBeNull();
    });

    it("should propagate changes to the form control", () => {
        const onChangeSpy = jasmine.createSpy("onChange");
        de.componentInstance.registerOnChange(onChangeSpy);

        testComponent.poolId = "poolSecondValid";
        poolServiceReturned.next(poolSecondValid);
        fixture.detectChanges();

        expect(onChangeSpy).toHaveBeenCalledWith("ubuntu_maya2018u3_arnold3101");
    });
});
