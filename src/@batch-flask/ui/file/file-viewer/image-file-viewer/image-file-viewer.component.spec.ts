import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Subject, of } from "rxjs";
import { ImageFileViewerComponent } from "./image-file-viewer.component";

@Component({
    template: `<bl-image-file-viewer [fileLoader]="fileLoader"></bl-image-file-viewer>`,
})
class TestComponent {
    public fileLoader;
}

describe("ImageFileViewerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let imgEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ImageFileViewerComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.fileLoader = {
            filename: "foo.png",
            properties: new Subject(),
            cache: jasmine.createSpy().and.returnValue(of("/local/path/to/file.txt")),
        };
        de = fixture.debugElement.query(By.css("bl-image-file-viewer"));
        fixture.detectChanges();
        imgEl = de.query(By.css("img"));
    });

    it("chache the image", () => {
        expect(testComponent.fileLoader.cache).toHaveBeenCalledOnce();
    });

    it("point to the cached file locally", () => {
        expect(imgEl).not.toBeFalsy();
        expect(imgEl.nativeElement.getAttribute("src")).toEqual("file:///local/path/to/file.txt");
    });

    it("it shows an alt text for the image", () => {
        expect(imgEl).not.toBeFalsy();
        expect(imgEl.nativeElement.getAttribute("alt")).toEqual("Displaying image foo.png");
    });

    it("refresh again when file has changed", () => {
        testComponent.fileLoader.properties.next(null);
        expect(testComponent.fileLoader.cache).toHaveBeenCalledTimes(2);
    });
});
