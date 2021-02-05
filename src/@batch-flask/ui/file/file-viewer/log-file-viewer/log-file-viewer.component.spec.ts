import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { File, FileLoader } from "@batch-flask/ui/file";
import { LoadingModule } from "@batch-flask/ui/loading";
import { EditorMockComponent, EditorTestingModule } from "@batch-flask/ui/testing";
import { of } from "rxjs";
import { FileViewerConfig } from "../file-viewer";
import { LogFileViewerComponent } from "./log-file-viewer.component";

@Component({
    template: `<bl-log-file-viewer [fileLoader]="fileLoader" [config]="config"></bl-log-file-viewer>`,
})
class TestComponent {
    public fileLoader;
    public config: FileViewerConfig;
}

// eslint-disable-next-line max-len
const sampleFile = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

describe("LogFileViewer", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let editorComponent: EditorMockComponent;
    let fileLoader: FileLoader;
    let file: File;
    let contentSpy: jasmine.Spy;
    let propertiesSpy: jasmine.Spy;

    beforeEach(() => {
        file = new File({ name: "foo.ts", properties: { contentLength: 12 } });
        contentSpy = jasmine.createSpy("content").and.callFake(({ rangeStart, rangeEnd }) => {
            return of({ content: sampleFile.slice(rangeStart, rangeEnd) });
        });
        propertiesSpy = jasmine.createSpy("propertyGetter").and.callFake(() => of(file));

        fileLoader = new FileLoader({
            filename: "foo.ts",
            source: "some-source",
            fs: {} as any,
            content: contentSpy,
            properties: propertiesSpy,
        });
        TestBed.configureTestingModule({
            imports: [EditorTestingModule, LoadingModule],
            declarations: [LogFileViewerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();
        de = fixture.debugElement.query(By.css("bl-log-file-viewer"));
        editorComponent = de.query(By.css("bl-editor")).componentInstance;

    });

    it("gets the next set of bytes when file change", () => {
        testComponent.fileLoader = fileLoader;
        fixture.detectChanges();

        expect(contentSpy).toHaveBeenCalledTimes(1);
        expect(contentSpy).toHaveBeenCalledWith({
            rangeStart: 0, rangeEnd: 11,
        });

        expect(editorComponent.value).toEqual("Lorem ipsum");

        file = new File({ name: "foo.ts", properties: { contentLength: 45 } });
        fileLoader.refreshProperties().subscribe();
        expect(contentSpy).toHaveBeenCalledTimes(2);
        expect(contentSpy).toHaveBeenCalledWith({
            rangeStart: 12, rangeEnd: 44,
        });
        fixture.detectChanges();
        expect(editorComponent.value).toEqual("Lorem ipsumdolor sit amet, consectetur adip");
    });

    it("checks for updates every x seconds", fakeAsync(() => {
        testComponent.fileLoader = fileLoader;
        testComponent.config = {
            tailable: true,
        };
        fixture.detectChanges();

        expect(propertiesSpy).toHaveBeenCalledTimes(1);
        expect(contentSpy).toHaveBeenCalledTimes(1);
        expect(contentSpy).toHaveBeenCalledWith({
            rangeStart: 0, rangeEnd: 11,
        });

        expect(editorComponent.value).toEqual("Lorem ipsum");

        file = new File({ name: "foo.ts", properties: { contentLength: 45 } });
        tick(5000);
        expect(propertiesSpy).toHaveBeenCalledTimes(2);
        expect(contentSpy).toHaveBeenCalledTimes(2);
        expect(contentSpy).toHaveBeenCalledWith({
            rangeStart: 12, rangeEnd: 44,
        });
        fixture.detectChanges();
        expect(editorComponent.value).toEqual("Lorem ipsumdolor sit amet, consectetur adip");

        file = new File({ name: "foo.ts", properties: { contentLength: 79 } });
        tick(5000);
        expect(propertiesSpy).toHaveBeenCalledTimes(3);
        expect(contentSpy).toHaveBeenCalledTimes(3);
        expect(contentSpy).toHaveBeenCalledWith({
            rangeStart: 45, rangeEnd: 78,
        });
        fixture.detectChanges();
        expect(editorComponent.value)
            .toEqual("Lorem ipsumdolor sit amet, consectetur adipscing elit, sed do eiusmod tempor");
        fixture.destroy();
    }));
});
