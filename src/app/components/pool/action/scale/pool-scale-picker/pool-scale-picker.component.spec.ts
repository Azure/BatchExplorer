import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { PoolScalePickerComponent } from "./pool-scale-picker.component";

@Component({
    template: `<bl-pool-scale-picker></bl-pool-scale-picker>`,
})
class TestComponent {
}

fdescribe("PoolScalePickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: PoolScalePickerComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [PoolScalePickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-pool-scale-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
