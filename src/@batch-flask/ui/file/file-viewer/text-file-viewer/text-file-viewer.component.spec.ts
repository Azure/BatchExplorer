import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { File } from "@batch-flask/ui/file/file.model";
import { LoadingModule } from "@batch-flask/ui/loading";
import { EditorMockComponent, EditorTestingModule } from "@batch-flask/ui/testing";
import { KeyCode, KeyMod, Uri } from "monaco-editor";
import { Subject, of } from "rxjs";
import { TextFileViewerComponent } from "./text-file-viewer.component";

@Component({
    template: `<bl-text-file-viewer [fileLoader]="fileLoader"></bl-text-file-viewer>`,
})
class TestComponent {
    public fileLoader;
}

describe("TextFileViewer", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let editorComponent: EditorMockComponent;

    beforeAll(async () => {
        await import("monaco-editor");
    });

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

    it("gets the content of the file loader when set", fakeAsync(() => {
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: () => of({ content: "export const FOO=1" }),
            properties: new Subject(),
        };
        fixture.detectChanges();
        expect(editorComponent.value).toEqual("export const FOO=1");
    }));

    it("set the config correctly of the file loader when set", async () => {
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: () => of({ content: "export const FOO=1" }),
            properties: new Subject(),
        };
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(editorComponent.config).toEqual({
            readOnly: true,
            minimap: {
                enabled: false,
            },
            uri: Uri.file("foo.ts"),
        });
    });
    it("set ctrl+s keybindings to save when file loader allows it", async () => {
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: () => of({ content: "export const FOO=1" }),
            properties: new Subject(),
            write: () => of(null),
        };
        fixture.detectChanges();
        await new Promise((resolve) => setTimeout(resolve));
        fixture.detectChanges();

        expect(editorComponent.config).toEqual({
            readOnly: true,
            minimap: {
                enabled: false,
            },
            uri: Uri.file("foo.ts"),
            keybindings: [
                { key: KeyMod.CtrlCmd | KeyCode.KEY_S, action: jasmine.anything() },
            ],
        });
    });

    it("reload the content when the file changes", () => {
        const contentSpy = jasmine.createSpy().and.callFake(() => of({ content: "export const FOO=1" }));
        testComponent.fileLoader = {
            filename: "foo.ts",
            content: contentSpy,
            properties: new Subject(),
        };
        fixture.detectChanges();

        expect(contentSpy).toHaveBeenCalledTimes(1);

        testComponent.fileLoader.properties.next(new File({ name: "foo.ts", properties: { contentLength: 24 } }));
        expect(contentSpy).toHaveBeenCalledTimes(2);
    });
});
