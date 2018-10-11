import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { File } from "@batch-flask/ui/file/file.model";
import { LoadingModule } from "@batch-flask/ui/loading";
import { EditorMockComponent, EditorTestingModule } from "@batch-flask/ui/testing";
import { Uri } from "monaco-editor";
import { Subject, of } from "rxjs";
import { TextFileViewerComponent } from "./text-file-viewer.component";

@Component({
    template: `<bl-text-file-viewer [fileLoader]="fileLoader"></bl-text-file-viewer>`,
})
class TestComponent {
    public fileLoader;
}

fdescribe("TextFileViewer", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let editorComponent: EditorMockComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EditorTestingModule, LoadingModule],
            declarations: [TextFileViewerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-text-file-viewer"));
        fixture.detectChanges();
        editorComponent = de.query(By.css("bl-editor")).componentInstance;
    });

    it("gets the content of the file loader when set", () => {
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: () => of({ content: "export const FOO=1" }),
            fileChanged: new Subject(),
        };
        fixture.detectChanges();

        expect(editorComponent.value).toEqual("export const FOO=1");
    });

    it("gets the content of the file loader when set", () => {
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: () => of({ content: "export const FOO=1" }),
            fileChanged: new Subject(),
        };
        fixture.detectChanges();

        expect(editorComponent.config).toEqual({
            readOnly: true,
            minimap: {
                enabled: false,
            },
            uri: Uri.file("foo.ts"),
        });
    });

    it("reload the content when the file changes", () => {
        const contentSpy = jasmine.createSpy().and.callFake(() => of({ content: "export const FOO=1" }));
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: contentSpy,
            fileChanged: new Subject(),
        };
        fixture.detectChanges();

        expect(contentSpy).toHaveBeenCalledTimes(1);

        testComponent.fileLoader.fileChanged.next(new File({ name: "foo.ts", properties: { contentLength: 24 } }));
        expect(contentSpy).toHaveBeenCalledTimes(2);
    });
});
