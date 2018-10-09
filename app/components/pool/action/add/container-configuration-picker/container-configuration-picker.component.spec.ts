import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ContainerConfigurationPickerComponent } from "./container-configuration-picker.component";

@Component({
    template: `<bl-container-configuration-picker></bl-container-configuration-picker>`,
})
class TestComponent {
}

describe("ContainerConfigurationComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: ContainerConfigurationPickerComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            declarations: [ContainerConfigurationPickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-container-configuration-picker"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
