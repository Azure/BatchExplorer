import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { MockElectronRemote, MockElectronShell } from "@batch-flask/electron/testing";
import { File, FileLoader } from "@batch-flask/ui";
import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { ButtonsModule } from "@batch-flask/ui/buttons";
import { CardComponent } from "@batch-flask/ui/card";
import { LoadingComponent } from "@batch-flask/ui/loading";
import { of } from "rxjs";
import { click } from "test/utils/helpers";
import { NotificationServiceMock } from "test/utils/mocks";
import { FileTooLargeComponent } from "../file-too-large";
import { FileTypeAssociationService } from "../file-type-association";
import { FileViewerConfig } from "../file-viewer/file-viewer";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { FileViewerContainerComponent } from "./file-viewer-container.component";
import { FileViewerHeaderComponent } from "./file-viewer-header";

@Component({
    template: `<bl-file-viewer-container [fileLoader]="fileLoader" [config]="config"></bl-file-viewer-container>`,
})
class TestComponent {
    public fileLoader: FileLoader;
    public config: FileViewerConfig  = {};
}

const file = new File({ name: "foo.ts", properties: { contentLength: 45 } } as any);

describe("FileViewerContainerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let shellSpy: MockElectronShell;
    let remoteSpy: MockElectronRemote;
    let notificationServiceSpy: NotificationServiceMock;

    let fsSpy;
    let propertyGetterSpy: jasmine.Spy;
    let contentSpy: jasmine.Spy;

    beforeEach(() => {
        fsSpy = {
            ensureDir: jasmine.createSpy("ensureDir").and.returnValue(Promise.resolve(true)),
            saveFile: jasmine.createSpy("saveFile").and.returnValue(Promise.resolve(true)),
        };
        propertyGetterSpy = jasmine.createSpy("propertiesGetter").and.callFake(() => of(file));
        contentSpy = jasmine.createSpy("content").and.returnValue(of({ content: "export const foo = 123;" }));
        shellSpy = new MockElectronShell();
        remoteSpy = new MockElectronRemote();
        notificationServiceSpy = new NotificationServiceMock();

        TestBed.configureTestingModule({
            imports: [I18nTestingModule, ButtonsModule],
            declarations: [
                FileViewerContainerComponent, TestComponent,
                FileViewerHeaderComponent, FileTooLargeComponent, CardComponent,
                ImageFileViewerComponent, LoadingComponent,
            ],
            providers: [
                FileTypeAssociationService,
                {
                    provide: BatchFlaskSettingsService, useValue: {
                        settings: {},
                        settingsObs: of({}),
                    },
                },
                remoteSpy.asProvider(),
                shellSpy.asProvider(),
                notificationServiceSpy.asProvider(),
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        TestBed.overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [ImageFileViewerComponent],
            },
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-viewer-container"));
        testComponent.fileLoader = new FileLoader({
            filename: "foo.ts",
            source: "fake-source",
            groupId: "fake-group",
            fs: fsSpy,
            properties: propertyGetterSpy,
            content: contentSpy,
        });
        fixture.detectChanges();
    });

    it("pass the config down to the header", () => {
        const header: FileViewerHeaderComponent = de.query(By.directive(FileViewerHeaderComponent)).componentInstance;
        expect(header.config).toEqual({
            downloadEnabled: true,
            tailable: false,
        });

        testComponent.config = {
            tailable: true,
        };
        fixture.detectChanges();

        expect(header.config).toEqual({
            downloadEnabled: true,
            tailable: true,
        });
    });

    describe("when file extension is unkown", () => {
        beforeEach(() => {
            testComponent.fileLoader = new FileLoader({
                filename: "foo.ts.01",
                source: "fake-source",
                groupId: "fake-group",
                fs: fsSpy,
                properties: propertyGetterSpy,
                content: contentSpy,
            });
            fixture.detectChanges();
        });

        it("shows the viewer picker", () => {
            const el = de.query(By.css(".unknown-file-type"));
            expect(el).not.toBeFalsy();
            expect(el.nativeElement.textContent).toContain("file-viewer-container.unkownFileType");
            expect(el.queryAll(By.css("bl-button")).length).toBe(3);
        });

        it("update to show the selected viewer after selecting", () => {
            const el = de.query(By.css(".unknown-file-type"));
            expect(el).not.toBeFalsy();
            click(el.queryAll(By.css("bl-button"))[2]);
            fixture.detectChanges();

            expect(de.query(By.css(".unknown-file-type"))).toBeFalsy("Shouldn't show the unkown file choices anymore");
            expect(de.query(By.css("bl-image-file-viewer"))).not.toBeFalsy("Should have inserted the image viewer");
        });
    });
});
