import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { RenderApplication, RenderEngine } from "app/models/rendering-container-image";
import { RenderingContainerImageService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { GithubDataServiceMock } from "test/utils/mocks";
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

fdescribe("RenderingContainerImagePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    let appVersionSelect: SelectComponent;
    let rendererVersionSelect: SelectComponent;

    let renderingContainerImageServiceSpy;

    const filteredContainerImagesReturn = new BehaviorSubject(null);
    const findContainerImageByIdReturn = new BehaviorSubject(null);

    const allContainerImages = new GithubDataServiceMock().githubDataResponse.containerImages;

    const containerImagesForMayaArnoldUbuntu = allContainerImages.filter(image => {
        return image.app === RenderApplication.Maya
        && image.renderer === RenderEngine.Arnold
        && image.imageReferenceId === "ubuntu-1604lts-container";
    });

    beforeEach(() => {

        filteredContainerImagesReturn.next(containerImagesForMayaArnoldUbuntu);

        renderingContainerImageServiceSpy = {
            getFilteredContainerImages: jasmine.createSpy("getFilteredContainerImages")
                .and.returnValue(filteredContainerImagesReturn),

            findContainerImageById: jasmine.createSpy("findContainerImageById")
                .and.returnValue(findContainerImageByIdReturn),
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

    it("Shows all appVersion options for the app / renderer / imageReference alphabetically", () => {
        const options = appVersionSelect.options.toArray();
        expect(options.length).toEqual(4);
        expect(options[0].value).toEqual("2017-Update5");
        expect(options[0].label).toEqual("2017-Update5");

        expect(options[1].value).toEqual("2018-Update2");
        expect(options[1].label).toEqual("2018-Update2");

        expect(options[2].value).toEqual("2018-Update3");
        expect(options[2].label).toEqual("2018-Update3");

        expect(options[3].value).toEqual("2018-Update4");
        expect(options[3].label).toEqual("2018-Update4");
    });

    it("Shows all rendererVersion options for the app / renderer / imageReference alphabetically", () => {
        const options = rendererVersionSelect.options.toArray();
        expect(options.length).toEqual(3);

        expect(options[0].value).toEqual("2.0.1.1");
        expect(options[0].label).toEqual("2.0.1.1");

        expect(options[1].value).toEqual("2.0.2.3");
        expect(options[1].label).toEqual("2.0.2.3");

        expect(options[2].value).toEqual("3.1.0.1");
        expect(options[2].label).toEqual("3.1.0.1");
    });

    it("appVersion default to none", () => {
        expect(appVersionSelect.value).toEqual(null);
    });

    it("rendererVersion default to none", () => {
        expect(rendererVersionSelect.value).toEqual(null);
    });

    it("no containerImage is displayed", () => {
        expect(de.query(By.css(".container-image-display"))).toEqual(null);
    });

    describe("when first selecting an application version", () => {
        beforeEach(() => {
            appVersionSelect.selectOption(appVersionSelect.options.toArray()[1]);
            fixture.detectChanges();
        });

        it("shows the corresponding renderer versions", () => {
            const options = rendererVersionSelect.options.toArray();
            expect(options.length).toEqual(2);
            expect(options[0].value).toEqual("2.0.1.1");
            expect(options[0].label).toEqual("2.0.1.1");

            expect(options[1].value).toEqual("2.0.2.3");
            expect(options[1].label).toEqual("2.0.2.3");
        });

        it("no rendererVersion is selected", () => {
            expect(rendererVersionSelect.value).toEqual(null);
        });

        it("no containerImage is displayed", () => {
            expect(de.query(By.css(".container-image-display"))).toEqual(null);
        });

        it("no containerImage is propagated", () => {
            expect(testComponent.control.value).toBeUndefined();
        });

        it("remove selection option is displayed in appVersionSelect", () => {
            const options = appVersionSelect.options.toArray();
            expect(options.length).toEqual(5);
            expect(options[4].label).toContain("Remove Selection");
        });

        describe("then selecting the remove selection option", () => {
            beforeEach(() => {
                appVersionSelect.selectOption(appVersionSelect.options.toArray()[4]);
                fixture.detectChanges();
            });

            it("appVersion options are reset", () => {
                const options = appVersionSelect.options.toArray();
                expect(options.length).toEqual(4);
                expect(options[0].value).toEqual("2017-Update5");
                expect(options[0].label).toEqual("2017-Update5");

                expect(options[1].value).toEqual("2018-Update2");
                expect(options[1].label).toEqual("2018-Update2");

                expect(options[2].value).toEqual("2018-Update3");
                expect(options[2].label).toEqual("2018-Update3");

                expect(options[3].value).toEqual("2018-Update4");
                expect(options[3].label).toEqual("2018-Update4");
            });

            it("rendererVersion options are reset", () => {
                const options = rendererVersionSelect.options.toArray();
                expect(options.length).toEqual(3);

                expect(options[0].value).toEqual("2.0.1.1");
                expect(options[0].label).toEqual("2.0.1.1");

                expect(options[1].value).toEqual("2.0.2.3");
                expect(options[1].label).toEqual("2.0.2.3");

                expect(options[2].value).toEqual("3.1.0.1");
                expect(options[2].label).toEqual("3.1.0.1");
            });

            it("no appVersion is selected", () => {
                expect(appVersionSelect.value).toEqual("");
            });

            it("no containerImage is displayed", () => {
                expect(de.query(By.css(".container-image-display"))).toEqual(null);
            });

            it("no containerImage is propagated", () => {
                expect(testComponent.control.value).toEqual("");
            });
        });

        describe("then selecting a renderer version", () => {
            beforeEach(() => {
                rendererVersionSelect.selectOption(rendererVersionSelect.options.toArray()[1]);
                fixture.detectChanges();
            });

            it("containerImage value is displayed", () => {
                expect(de.query(By.css(".container-image-display"))
                    .nativeElement.textContent).toContain("ubuntu_maya2018u2_arnold2023");
            });

            it("containerImage value is propagated", () => {
                expect(testComponent.control.value).toEqual("ubuntu_maya2018u2_arnold2023");
            });

            it("remove selection option is displayed in rendererVersionSelect", () => {
                const options = rendererVersionSelect.options.toArray();
                expect(options.length).toEqual(3);
                expect(options[2].label).toContain("Remove Selection");
            });

            it("the app version options are filtered by selected rendererVersion", () => {
                const options = appVersionSelect.options.toArray();
                expect(options.length).toEqual(3);
                expect(options[0].value).toEqual("2017-Update5");
                expect(options[0].label).toEqual("2017-Update5");

                expect(options[1].value).toEqual("2018-Update2");
                expect(options[1].label).toEqual("2018-Update2");
            });

            it("the remove selection option is displayed on the appVersionSelect", () => {
                const options = appVersionSelect.options.toArray();
                expect(options[2].value).toContain("Remove Selection");
                expect(options[2].label).toContain("Remove Selection");
            });

            describe("then selecting the remove appVersion selection option", () => {
                beforeEach(() => {
                    appVersionSelect.selectOption(appVersionSelect.options.toArray()[2]);
                    fixture.detectChanges();
                });

                it("rendererVersion options are reset", () => {
                    const options = rendererVersionSelect.options.toArray();
                    expect(options.length).toEqual(4);

                    expect(options[0].value).toEqual("2.0.1.1");
                    expect(options[0].label).toEqual("2.0.1.1");

                    expect(options[1].value).toEqual("2.0.2.3");
                    expect(options[1].label).toEqual("2.0.2.3");

                    expect(options[2].value).toEqual("3.1.0.1");
                    expect(options[2].label).toEqual("3.1.0.1");

                    expect(options[3].value).toContain("Remove Selection");
                    expect(options[3].label).toContain("Remove Selection");
                });

                it("appVersion options lose the remove selection option", () => {
                    const options = appVersionSelect.options.toArray();
                    expect(options.length).toEqual(2);
                    expect(options[0].value).toEqual("2017-Update5");
                    expect(options[0].label).toEqual("2017-Update5");

                    expect(options[1].value).toEqual("2018-Update2");
                    expect(options[1].label).toEqual("2018-Update2");
                });

                it("no appVersion is selected", () => {
                    expect(appVersionSelect.value).toEqual("");
                });

                it("no containerImage is displayed", () => {
                    expect(de.query(By.css(".container-image-display"))).toEqual(null);
                });

                it("no containerImage is propagated", () => {
                    expect(testComponent.control.value).toEqual("");
                });
            });

            describe("then selecting the remove rendererVersion selection option", () => {
                beforeEach(() => {
                    rendererVersionSelect.selectOption(rendererVersionSelect.options.toArray()[2]);
                    fixture.detectChanges();
                });

                it("appVersion options are reset", () => {
                    const options = appVersionSelect.options.toArray();
                    expect(options.length).toEqual(5);
                    expect(options[0].value).toEqual("2017-Update5");
                    expect(options[0].label).toEqual("2017-Update5");

                    expect(options[1].value).toEqual("2018-Update2");
                    expect(options[1].label).toEqual("2018-Update2");

                    expect(options[2].value).toEqual("2018-Update3");
                    expect(options[2].label).toEqual("2018-Update3");

                    expect(options[3].value).toEqual("2018-Update4");
                    expect(options[3].label).toEqual("2018-Update4");

                    expect(options[4].value).toContain("Remove Selection");
                    expect(options[4].label).toContain("Remove Selection");
                });

                it("renderer version options lose the remove selection option", () => {
                    const options = rendererVersionSelect.options.toArray();
                    expect(options.length).toEqual(2);
                    expect(options[0].value).toEqual("2.0.1.1");
                    expect(options[0].label).toEqual("2.0.1.1");

                    expect(options[1].value).toEqual("2.0.2.3");
                    expect(options[1].label).toEqual("2.0.2.3");
                });

                it("no rendererVersion is selected", () => {
                    expect(rendererVersionSelect.value).toEqual("");
                });

                it("no containerImage is displayed", () => {
                    expect(de.query(By.css(".container-image-display"))).toEqual(null);
                });

                it("no containerImage is propagated", () => {
                    expect(testComponent.control.value).toEqual("");
                });
            });
        });
    });

    describe("when first selecting a renderer version", () => {
        beforeEach(() => {
            rendererVersionSelect.selectOption(rendererVersionSelect.options.toArray()[1]);
            fixture.detectChanges();
        });

        it("shows the corresponding appVersions", () => {
            const options = appVersionSelect.options.toArray();
            expect(options.length).toEqual(2);
            expect(options[0].value).toEqual("2017-Update5");
            expect(options[0].label).toEqual("2017-Update5");

            expect(options[1].value).toEqual("2018-Update2");
            expect(options[1].label).toEqual("2018-Update2");
        });

        it("no appVersion is selected", () => {
            expect(appVersionSelect.value).toEqual(null);
        });

        it("no containerImage is propagated", () => {
            expect(testComponent.control.value).toBeUndefined();
        });

        it("no containerImage is displayed", () => {
            expect(de.query(By.css(".container-image-display"))).toEqual(null);
        });

        it("remove selection option is displayed in rendererVersionSelect", () => {
            const options = rendererVersionSelect.options.toArray();
            expect(options.length).toEqual(4);
            expect(options[3].label).toContain("Remove Selection");
        });

        describe("then selecting the remove selection option", () => {
            beforeEach(() => {
                rendererVersionSelect.selectOption(rendererVersionSelect.options.toArray()[3]);
                fixture.detectChanges();
            });

            it("rendererVersion options are reset, and include the remove selection option", () => {
                const options = rendererVersionSelect.options.toArray();
                expect(options.length).toEqual(3);

                expect(options[0].value).toEqual("2.0.1.1");
                expect(options[0].label).toEqual("2.0.1.1");

                expect(options[1].value).toEqual("2.0.2.3");
                expect(options[1].label).toEqual("2.0.2.3");

                expect(options[2].value).toEqual("3.1.0.1");
                expect(options[2].label).toEqual("3.1.0.1");
            });

            it("appVersion options are reset, and include the remove selection option", () => {
                const options = appVersionSelect.options.toArray();
                expect(options.length).toEqual(4);
                expect(options[0].value).toEqual("2017-Update5");
                expect(options[0].label).toEqual("2017-Update5");

                expect(options[1].value).toEqual("2018-Update2");
                expect(options[1].label).toEqual("2018-Update2");

                expect(options[2].value).toEqual("2018-Update3");
                expect(options[2].label).toEqual("2018-Update3");

                expect(options[3].value).toEqual("2018-Update4");
                expect(options[3].label).toEqual("2018-Update4");
            });

            it("no rendererVersion is selected", () => {
                expect(rendererVersionSelect.value).toEqual("");
            });

            it("no containerImage is displayed", () => {
                expect(de.query(By.css(".container-image-display"))).toEqual(null);
            });

            it("no containerImage is propagated", () => {
                expect(testComponent.control.value).toEqual("");
            });
        });

        describe("then selecting an app version", () => {
            beforeEach(() => {
                appVersionSelect.selectOption(appVersionSelect.options.toArray()[1]);
                fixture.detectChanges();
            });

            it("containerImage value is displayed", () => {
                expect(de.query(By.css(".container-image-display"))
                    .nativeElement.textContent).toContain("ubuntu_maya2018u2_arnold2023");
            });

            it("containerImage value is propagated", () => {
                expect(testComponent.control.value).toEqual("ubuntu_maya2018u2_arnold2023");
            });

            it("remove selection option is displayed in appVersionSelect", () => {
                const options = appVersionSelect.options.toArray();
                expect(options.length).toEqual(3);
                expect(options[2].label).toContain("Remove Selection");
            });

            describe("then selecting the remove appVersion selection option", () => {
                beforeEach(() => {
                    appVersionSelect.selectOption(appVersionSelect.options.toArray()[2]);
                    fixture.detectChanges();
                });

                it("rendererVersion options are reset, and include the remove selection option", () => {
                    const options = rendererVersionSelect.options.toArray();
                    expect(options.length).toEqual(4);

                    expect(options[0].value).toEqual("2.0.1.1");
                    expect(options[0].label).toEqual("2.0.1.1");

                    expect(options[1].value).toEqual("2.0.2.3");
                    expect(options[1].label).toEqual("2.0.2.3");

                    expect(options[2].value).toEqual("3.1.0.1");
                    expect(options[2].label).toEqual("3.1.0.1");

                    expect(options[3].value).toContain("Remove Selection");
                    expect(options[3].label).toContain("Remove Selection");
                });

                it("appVersion options lose the remove selection option", () => {
                    const options = appVersionSelect.options.toArray();
                    expect(options.length).toEqual(2);
                    expect(options[0].value).toEqual("2017-Update5");
                    expect(options[0].label).toEqual("2017-Update5");

                    expect(options[1].value).toEqual("2018-Update2");
                    expect(options[1].label).toEqual("2018-Update2");
                });

                it("no appVersion is selected", () => {
                    expect(appVersionSelect.value).toEqual("");
                });

                it("no containerImage is displayed", () => {
                    expect(de.query(By.css(".container-image-display"))).toEqual(null);
                });

                it("no containerImage is propagated", () => {
                    expect(testComponent.control.value).toEqual("");
                });
            });

            describe("then selecting the remove rendererVersion selection option", () => {
                beforeEach(() => {
                    rendererVersionSelect.selectOption(rendererVersionSelect.options.toArray()[2]);
                    fixture.detectChanges();
                });

                it("appVersion options are reset, and include the remove selection option", () => {
                    const options = appVersionSelect.options.toArray();
                    expect(options.length).toEqual(5);
                    expect(options[0].value).toEqual("2017-Update5");
                    expect(options[0].label).toEqual("2017-Update5");

                    expect(options[1].value).toEqual("2018-Update2");
                    expect(options[1].label).toEqual("2018-Update2");

                    expect(options[2].value).toEqual("2018-Update3");
                    expect(options[2].label).toEqual("2018-Update3");

                    expect(options[3].value).toEqual("2018-Update4");
                    expect(options[3].label).toEqual("2018-Update4");

                    expect(options[4].value).toContain("Remove Selection");
                    expect(options[4].label).toContain("Remove Selection");
                });

                it("renderer version options lose the remove selection option", () => {
                    const options = rendererVersionSelect.options.toArray();
                    expect(options.length).toEqual(2);
                    expect(options[0].value).toEqual("2.0.1.1");
                    expect(options[0].label).toEqual("2.0.1.1");

                    expect(options[1].value).toEqual("2.0.2.3");
                    expect(options[1].label).toEqual("2.0.2.3");
                });

                it("no rendererVersion is selected", () => {
                    expect(rendererVersionSelect.value).toEqual("");
                });

                it("no containerImage is displayed", () => {
                    expect(de.query(By.css(".container-image-display"))).toEqual(null);
                });

                it("no containerImage is propagated", () => {
                    expect(testComponent.control.value).toEqual("");
                });
            });
        });
    });
});
