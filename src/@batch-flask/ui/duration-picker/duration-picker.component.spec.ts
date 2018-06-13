import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { DurationPickerComponent } from "./duration-picker.component";

@Component({
    template: `<bl-duration-picker></bl-duration-picker>`,
})
class TestComponent {
}

fdescribe("DurationPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: DurationPickerComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [DurationPickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-duration-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
