import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { FileContentComponent } from "app/components/file/details";
import { File } from "app/models";
import { FileService, StorageService } from "app/services";
import { click } from "test/utils/helpers";

@Component({
    template: `<bl-file-content [fileLoader]="fileLoader"></bl-file-content>`,
})
class TestComponent {
    public fileLoader = {
        filename: "some.txt",
    };
}

describe("FileContentComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: FileContentComponent;
    let de: DebugElement;

    let storageServiceSpy;
    let fileServiceSpy;

    beforeEach(() => {
        storageServiceSpy = {};
        fileServiceSpy = {
            fileFromNode: (pool, node, filename) => ({
                properties: () => Observable.of(new File()),
                content: () => Observable.of({ content: "something" }),
            }),
        };
        TestBed.configureTestingModule({
            imports: [],
            declarations: [FileContentComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: StorageService, useValue: storageServiceSpy },
                { provide: FileService, useValue: fileServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-content"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("when file is of type log it should show the log file viewer", () => {
        testComponent.fileLoader = {
            filename: "some.log",
        };
        fixture.detectChanges();
        expect(de.query(By.css("bl-log-file-viewer"))).not.toBeFalsy();
        expect(de.query(By.css("bl-image-file-viewer"))).toBeFalsy();
        expect(de.query(By.css("bl-code-file-viewer"))).toBeFalsy();
        expect(de.query(By.css(".unknown-file-type"))).toBeFalsy();
    });

    it("when file is of type png it should show the image file viewer", () => {
        testComponent.fileLoader = {
            filename: "some.png",
        };
        fixture.detectChanges();
        expect(de.query(By.css("bl-log-file-viewer"))).toBeFalsy();
        expect(de.query(By.css("bl-image-file-viewer"))).not.toBeFalsy();
        expect(de.query(By.css("bl-code-file-viewer"))).toBeFalsy();
        expect(de.query(By.css(".unknown-file-type"))).toBeFalsy();
    });

    it("when file is of type py it should show the code file viewer", () => {
        testComponent.fileLoader = {
            filename: "some.py",
        };
        fixture.detectChanges();
        expect(de.query(By.css("bl-log-file-viewer"))).toBeFalsy();
        expect(de.query(By.css("bl-image-file-viewer"))).toBeFalsy();
        expect(de.query(By.css("bl-code-file-viewer"))).not.toBeFalsy();
        expect(de.query(By.css(".unknown-file-type"))).toBeFalsy();
    });

    it("when file is of unkown type", () => {
        testComponent.fileLoader = {
            filename: "some.custom",
        };
        fixture.detectChanges();
        expect(de.query(By.css("bl-log-file-viewer"))).toBeFalsy();
        expect(de.query(By.css("bl-image-file-viewer"))).toBeFalsy();
        expect(de.query(By.css("bl-code-file-viewer"))).toBeFalsy();
        expect(de.query(By.css(".unknown-file-type"))).not.toBeFalsy();

        const codeBtn = de.query(By.css(".unknown-file-type .code"));

        expect(codeBtn).not.toBeFalsy("Should have the open as code button");

        click(codeBtn);
        fixture.detectChanges();

        expect(de.query(By.css("bl-code-file-viewer"))).not.toBeFalsy("Should now show the code viewer");

        expect(de.query(By.css(".unknown-file-type"))).toBeFalsy("Should not show the unkown file type anymore");
    });
});
