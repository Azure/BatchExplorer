import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BoolPropertyComponent, NoItemComponent, SidebarManager, TextPropertyComponent } from "@batch-flask/ui";
import { AutoPoolSpecification } from "app/models";
import { PoolService } from "app/services";
import { JobScheduleAutoPoolComponent } from "./job-schedule-autopool.component";

const poolWithoutStartTask = new AutoPoolSpecification({
    pool: {
        targetDedicatedNodes: 2,
    } as any,
});

const poolWithStartTask = new AutoPoolSpecification({
    pool: {
        targetDedicatedNodes: 2,
        startTask: {
            commandLine: "hostname",
        },
    } as any,
});
@Component({
    template: `<bl-job-schedule-autopool [properties]="specs"></bl-job-schedule-autopool>`,
})
class TestComponent {

    public specs: AutoPoolSpecification = poolWithStartTask;
}

describe("JobScheduleAutoPoolComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [
                JobScheduleAutoPoolComponent,
                TestComponent,
                NoItemComponent,
                TextPropertyComponent,
                BoolPropertyComponent,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: SidebarManager, useValue: null },
                { provide: PoolService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-job-schedule-autopool"));
        fixture.detectChanges();
    });

    describe("Start task properties", () => {
        let startTaskGroupEl: DebugElement;

        beforeEach(() => {
            startTaskGroupEl = de.query(By.css("bl-property-group[label='Start task settings']"));
            expect(startTaskGroupEl).not.toBeFalsy();
        });

        it("show no start task when no start task on the pool spec", () => {
            testComponent.specs = poolWithoutStartTask;
            fixture.detectChanges();

            expect(startTaskGroupEl.nativeElement.textContent)
                .toContain("Start task is not specified for current pool.");
        });

        it("show the command line", () => {
            expect(startTaskGroupEl.nativeElement.textContent)
                .not.toContain("Start task is not specified for current pool.");

            const commandLineEl = de.query(By.css("bl-text-property[label='Command line']"));
            expect(commandLineEl).not.toBeFalsy();
            expect(commandLineEl.nativeElement.textContent).toContain("hostname");
        });
    });
});
