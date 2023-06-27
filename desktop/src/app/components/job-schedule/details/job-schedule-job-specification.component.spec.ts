import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
    BoolPropertyComponent, PropertyListComponent,
    SidebarManager, TextPropertyComponent,
} from "@batch-flask/ui";
import { Job } from "app/models";
import { JobService } from "app/services";
import { JobScheduleJobSpecificationComponent } from "./job-schedule-job-specification.component";

@Component({
    template: `<bl-job-schedule-job-specification [job]="job"></bl-job-schedule-job-specification>`,
})
class TestComponent {
    public job = new Job();
}

describe("JobScheduleJobSpecificationComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            declarations: [
                JobScheduleJobSpecificationComponent,
                TestComponent,
                BoolPropertyComponent,
                PropertyListComponent,
                TextPropertyComponent,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: SidebarManager, useValue: null },
                { provide: JobService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-job-schedule-job-specification"));
        fixture.detectChanges();
    });

    describe("when job has preparation task", () => {
        let releaseTaskGroup: DebugElement;

        beforeEach(() => {
            testComponent.job = new Job({
                id: "job-with-release-task",
                jobPreparationTask: {
                    commandLine: "hostname",
                },
            });
            fixture.detectChanges();
            releaseTaskGroup = de.query(By.css("bl-property-group[label='Job preparation task']"));
            expect(releaseTaskGroup).not.toBeFalsy();
        });

        it("show the command line", () => {
            const property = releaseTaskGroup.query(By.css("bl-text-property[label='Command line']"));
            expect(property.nativeElement.textContent).toContain("hostname");
        });
    });

    describe("when job has release task", () => {
        let releaseTaskGroup: DebugElement;

        beforeEach(() => {
            testComponent.job = new Job({
                id: "job-with-release-task",
                jobReleaseTask: {
                    commandLine: "hostname",
                },
            });
            fixture.detectChanges();
            releaseTaskGroup = de.query(By.css("bl-property-group[label='Job release task']"));
            expect(releaseTaskGroup).not.toBeFalsy();
        });

        it("show the command line", () => {
            const property = releaseTaskGroup.query(By.css("bl-text-property[label='Command line']"));
            expect(property.nativeElement.textContent).toContain("hostname");
        });
    });
});
