import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { FileOrDirectoryPickerComponent } from "./file-or-directory-picker.component";

@Component({
    template: `<bl-selector></bl-selector>`,
})
class TestComponent {
}

fdescribe("FileOrDirectoryPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: FileOrDirectoryPickerComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [FileOrDirectoryPickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-selector"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
