import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";

import { MaterialModule } from "@batch-flask/core";
import { DeallocationOptionPickerComponent } from "app/components/pool/action/scale";
import { BannerMockComponent } from "test/utils/mocks/components";

@Component({
    template: `<bl-deallocation-option-picker [(ngModel)]="taskAction"></bl-deallocation-option-picker>`,
})
class TestComponent {
    public taskAction: any = {};
}

describe("DeallocationOptionPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: DeallocationOptionPickerComponent;
    let banner: DebugElement;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MaterialModule, FormsModule, ReactiveFormsModule],
            declarations: [BannerMockComponent, DeallocationOptionPickerComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-deallocation-option-picker"));
        banner = de.query(By.css("bl-banner"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("should default to requeue being selected", () => {
        expect(testComponent.taskAction.nodeDeallocationOption).toBe("requeue");

        const options = de.queryAll(By.css(".mat-button-toggle-checked"));
        expect(options.length).toBe(1);
        expect(options[0].query(By.css(".mat-button-toggle-label-content")).nativeElement.textContent)
            .toContain("Requeue");
    });

    it("info text should be about requeue option", () => {
        expect(banner.nativeElement.textContent)
            .toContain("Terminate running task processes and requeue the tasks");
    });

    it("update option to terminate", () => {
        component.form.controls.nodeDeallocationOption.setValue("terminate");
        fixture.detectChanges();

        expect(testComponent.taskAction.nodeDeallocationOption).toBe("terminate");
        expect(banner.nativeElement.textContent).toContain("Terminate running tasks.");
    });

    it("update option to retaineddata", () => {
        component.form.controls.nodeDeallocationOption.setValue("retaineddata");
        fixture.detectChanges();

        expect(testComponent.taskAction.nodeDeallocationOption).toBe("retaineddata");
        expect(banner.nativeElement.textContent).toContain("wait for all task data retention periods");
    });

    it("update option to taskcompletion", () => {
        component.form.controls.nodeDeallocationOption.setValue("taskcompletion");
        fixture.detectChanges();

        expect(testComponent.taskAction.nodeDeallocationOption).toBe("taskcompletion");
        expect(banner.nativeElement.textContent).toContain("Remove nodes when all tasks have completed");
    });
});
