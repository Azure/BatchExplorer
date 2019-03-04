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

const pool1 = {
    id: "pool1",
    virtualMachineConfiguration: {
        containerConfiguration: {
            containerImageNames: [
                "renderingContainerImage1",
            ],
        },
    },
};

const renderingContainerImage1 = {
    appVersion: "2017Update5",
    rendererVersion: "2.0.1.1",
    containerImage: "renderingContainerImage1",
};

fdescribe("ContainerImageOnPoolComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let appVersionInput: any;
    let rendererVersionInput: any;

    let renderingContainerImageServiceSpy;
    let poolServiceSpy;
    const containerImageReturned = new BehaviorSubject(renderingContainerImage1);

    beforeEach(() => {
        poolServiceSpy = {
            get: jasmine.createSpy("get").and.returnValue(of(pool1)),
        };

        renderingContainerImageServiceSpy = {
            findContainerImageById: jasmine.createSpy("findContainerImageById").and.returnValue(containerImageReturned),
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
        testComponent.imageReferenceId = "centos-container-75";
        testComponent.ncjTemplateMode = NcjTemplateMode.ExistingPoolAndJob;
        testComponent.poolId = pool1.id;
        de = fixture.debugElement.query(By.css("bl-container-image-on-pool"));
        fixture.detectChanges();
        appVersionInput = de.query(By.css("input")).nativeElement;
        rendererVersionInput = de.queryAll(By.css("input"))[1].nativeElement;
    });

    fit("Shows the app and renderer version present on the pool", () => {
        expect(appVersionInput.value).toEqual("2017Update5");
        expect(rendererVersionInput.value).toEqual("2.0.1.1");
    });
});
