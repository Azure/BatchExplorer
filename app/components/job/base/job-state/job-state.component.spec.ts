import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { JobStateComponent } from "./job-state.component";

@Component({
    template: `<bl-job-state></bl-job-state>`,
})
class TestComponent {
}

fdescribe("JobStateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: JobStateComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [JobStateComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-job-state"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
