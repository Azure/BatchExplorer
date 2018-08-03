import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ButtonsModule } from "@batch-flask/ui";
import { TableTestingModule } from "@batch-flask/ui/testing";
import { TaskResourceFilesComponent } from "./task-resource-files.component";

@Component({
    template: `<bl-task-resource-files></bl-task-resource-files>`,
})
class TestComponent {
}

fdescribe("TaskResourceFilesComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: TaskResourceFilesComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TableTestingModule, ButtonsModule],
            declarations: [TaskResourceFilesComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-task-resource-files"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("", () => {
    });
});
