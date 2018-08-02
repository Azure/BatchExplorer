import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Observable, Subject, of } from "rxjs";

import { ImageFileViewerComponent } from "app/components/file/details/image-file-viewer";

@Component({
    template: `<bl-image-file-viewer [fileLoader]="fileLoader"></bl-image-file-viewer>`,
})
class TestComponent {
    public fileLoader;
}

describe("ImageFileViewerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ImageFileViewerComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [ImageFileViewerComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        testComponent.fileLoader = {
            cache: jasmine.createSpy("file-loader-cache").and.returnValue(of("cached/file.png")),
            fileChanged: new Subject(),
        };
        de = fixture.debugElement.query(By.css("bl-image-file-viewer"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("Should have called the cache method", () => {
        expect(testComponent.fileLoader.cache).toHaveBeenCalledOnce();
    });

    it("Sould set the image src", () => {
        fixture.detectChanges();
        expect(component.src).toEqual("file://cached/file.png");
        const img = de.query(By.css("img"));
        expect(img).not.toBeFalsy();
        expect(img.properties.src).toEqual("file://cached/file.png");
    });
});
