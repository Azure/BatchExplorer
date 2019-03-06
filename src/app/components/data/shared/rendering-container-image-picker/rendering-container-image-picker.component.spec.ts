import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { RenderApplication, RenderEngine } from "app/models/rendering-container-image";
import { RenderingContainerImageService } from "app/services";
import { BehaviorSubject, of } from "rxjs";
import { RenderingContainerImagePickerComponent } from "./rendering-container-image-picker.component";

@Component({
    template: `
        <bl-rendering-container-image-picker [formControl]="control"
            [app]="app" [renderEngine]="renderEngine" [imageReferenceId]="imageReferenceId">
        </bl-rendering-container-image-picker>
    `,
})

class TestComponent {
    public control = new FormControl(null);

    public app: RenderApplication;
    public renderEngine: RenderEngine;
    public imageReferenceId: string;
}

const ciUbuntuMaya2017Update5Arnold2011 = {
    containerImage: "ubuntu_maya_2017u5_arnold_2011",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2017-Update5",
    renderer: "arnold",
    rendererVersion: "2.0.1.1",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2017Update5Arnold2023 = {
    containerImage: "ubuntu_maya2017u5_arnold_2023",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2017-Update5",
    renderer: "arnold",
    rendererVersion: "2.0.2.3",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2018Update2Arnold2011 = {
    containerImage: "ubuntu_maya2018u2_arnold_2011",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2018-Update2",
    renderer: "arnold",
    rendererVersion: "2.0.1.1",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2018Update2Arnold2023 = {
    containerImage: "ubuntu_maya2018u2_arnold_2023",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2018-Update2",
    renderer: "arnold",
    rendererVersion: "2.0.2.3",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2018Update2Arnold3101 = {
    containerImage: "ubuntu_maya_arnold_3101",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2018-Update2",
    renderer: "arnold",
    rendererVersion: "3.1.0.1",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2018Update4Arnold2011 = {
    containerImage: "ubuntu_maya2018u2_arnold_2011",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2018-Update4",
    renderer: "arnold",
    rendererVersion: "2.0.1.1",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2018Update4Arnold2023 = {
    containerImage: "ubuntu_maya2018u2_arnold_2023",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2018-Update4",
    renderer: "arnold",
    rendererVersion: "2.0.2.3",
    imageReferenceId : "ubuntu-1604lts-container",
};
const ciUbuntuMaya2018Update4Arnold3101 = {
    containerImage: "ubuntu_maya_arnold_3101",
    os: "Ubuntu 16.04",
    app: "maya",
    appVersion: "2018-Update4",
    renderer: "arnold",
    rendererVersion: "3.1.0.1",
    imageReferenceId : "ubuntu-1604lts-container",
};

const allContainerImages = [ciUbuntuMaya2017Update5Arnold2011, ciUbuntuMaya2017Update5Arnold2023,
                            ciUbuntuMaya2018Update2Arnold2011, ciUbuntuMaya2018Update2Arnold2023,
                            ciUbuntuMaya2018Update2Arnold3101, ciUbuntuMaya2018Update4Arnold2011,
                            ciUbuntuMaya2018Update4Arnold2023, ciUbuntuMaya2018Update4Arnold3101];

describe("RenderingContainerImagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let appVersionSelect: SelectComponent;
    let rendererVersionSelect: SelectComponent;

    let renderingContainerImageServiceSpy;
    const containerImagesReturned = new BehaviorSubject(allContainerImages);

    beforeEach(() => {
        renderingContainerImageServiceSpy = {
            getFilteredContainerImages: jasmine.createSpy("getFilteredContainerImages")
                .and.returnValue(of([allContainerImages])),
            getContainerImagesForAppVersion: jasmine.createSpy("getContainerImagesForAppVersion")
                .and.returnValue(containerImagesReturned),
        };

        TestBed.configureTestingModule({
            imports: [FormsModule, FormModule, ReactiveFormsModule, SelectModule, I18nTestingModule],
            declarations: [RenderingContainerImagePickerComponent, TestComponent],
            providers: [
                { provide: RenderingContainerImageService, useValue: renderingContainerImageServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.app = RenderApplication.Maya;
        testComponent.renderEngine = RenderEngine.Arnold;
        testComponent.imageReferenceId = "ubuntu-1604lts-container";
        de = fixture.debugElement.query(By.css("bl-rendering-container-image-picker"));
        fixture.detectChanges();
        appVersionSelect = de.query(By.css(".app-version-picker")).componentInstance;
        rendererVersionSelect = de.query(By.css(".renderer-version-picker")).componentInstance;
    });

    it("Shows all options for the designated app", () => {
        const appVersionOptions = appVersionSelect.options.toArray();
        expect(appVersionOptions.length).toEqual(2);
    });

    it("appVersion default to none", () => {
        expect(appVersionSelect.value).toEqual(null);
    });

    it("Shows all rendererVersion options across all appVersions", () => {
        const rendererVersionOptions = rendererVersionSelect.options.toArray();
        expect(rendererVersionOptions.length).toEqual(8);
    });

    describe("when selecting an application version", () => {
        beforeEach(() => {
            appVersionSelect.selectOption(appVersionSelect.options.toArray()[1]);

            containerImagesReturned.next(
                [ciUbuntuMaya2017Update5Arnold2011, ciUbuntuMaya2017Update5Arnold2023]);

            fixture.detectChanges();
        });

        it("shows the corresponding renderer versions", () => {
            const options = rendererVersionSelect.options.toArray();
            expect(options.length).toEqual(2);
            expect(options[0].value).toEqual(ciUbuntuMaya2017Update5Arnold2011.containerImage);
            expect(options[0].label).toEqual(ciUbuntuMaya2017Update5Arnold2011.rendererVersion);

            expect(options[1].value).toEqual(ciUbuntuMaya2017Update5Arnold2023.containerImage);
            expect(options[1].label).toEqual(ciUbuntuMaya2017Update5Arnold2023.rendererVersion);
        });

        it("no rendererVersion is selected", () => {
            expect(rendererVersionSelect.value).toEqual(null);
        });

        it("no containerImage is propagated", () => {
            expect(testComponent.control.value).toEqual(null);
        });

        it("propagate changes when selecting rendererVersion", () => {
            rendererVersionSelect.selectOption(rendererVersionSelect.options.toArray()[1]);
            fixture.detectChanges();

            expect(testComponent.control.value).toEqual(ciUbuntuMaya2017Update5Arnold2023.containerImage);
        });
    });
});
