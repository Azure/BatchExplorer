import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatTooltipModule } from "@angular/material/tooltip";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { Job, JobState, JobTerminateReason } from "app/models";
import { JobStateComponent } from "./job-state.component";

@Component({
    template: `<bl-job-state [job]="job"></bl-job-state>`,
})
class TestComponent {
    public job: Job = new Job();
}

describe("JobStateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatTooltipModule, I18nTestingModule],
            declarations: [JobStateComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-job-state"));
        fixture.detectChanges();
    });

    it("show play icon and state for active job", () => {
        testComponent.job = new Job({ id: "active-job", state: JobState.active });
        fixture.detectChanges();
        expect(de.query(By.css(".fa-play-circle"))).not.toBeFalsy();
        expect(de.nativeElement.textContent).toContain("active");
    });

    it("show pause icon and state for disabled job", () => {
        testComponent.job = new Job({ id: "disabled-job", state: JobState.disabled });
        fixture.detectChanges();
        expect(de.query(By.css(".fa-pause-circle"))).not.toBeFalsy();
        expect(de.nativeElement.textContent).toContain("disabled");
    });

    it("show pause icon and state for disabling job", () => {
        testComponent.job = new Job({ id: "disabling-job", state: JobState.disabling });
        fixture.detectChanges();
        expect(de.query(By.css(".fa-pause-circle"))).not.toBeFalsy();
        expect(de.nativeElement.textContent).toContain("disabling");
    });

    it("show trash icon and state for deleting job", () => {
        testComponent.job = new Job({ id: "deleting-job", state: JobState.deleting });
        fixture.detectChanges();
        expect(de.query(By.css(".fa-trash"))).not.toBeFalsy();
        expect(de.nativeElement.textContent).toContain("deleting");
    });

    it("show stop icon and state for terminating job", () => {
        testComponent.job = new Job({ id: "deleting-job", state: JobState.terminating });
        fixture.detectChanges();
        expect(de.query(By.css(".fa-stop-circle"))).not.toBeFalsy();
        expect(de.nativeElement.textContent).toContain("terminating");
    });

    describe("completed job", () => {
        function setupJob(terminateReason: JobTerminateReason) {
            testComponent.job = new Job({
                id: "completed-job",
                state: JobState.completed,
                executionInfo: { terminateReason },
            });
            fixture.detectChanges();
        }

        it("show success when job terminated with userterminate", () => {
            setupJob(JobTerminateReason.UserTerminate);

            expect(de.classes["success"]).toBe(true);
            expect(de.classes["error"]).toBe(false);

            expect(de.query(By.css(".fa-check-circle"))).not.toBeFalsy();
            expect(de.nativeElement.textContent).toContain("completed");
            expect(de.nativeElement.textContent).toContain("UserTerminate");
        });

        it("show success when job terminated with all task completed", () => {
            setupJob(JobTerminateReason.AllTasksCompleted);

            expect(de.classes["success"]).toBe(true);
            expect(de.classes["error"]).toBe(false);

            expect(de.query(By.css(".fa-check-circle"))).not.toBeFalsy();
            expect(de.nativeElement.textContent).toContain("completed");
            expect(de.nativeElement.textContent).toContain("AllTasksCompleted");
        });

        it("show success when job terminated with jm complete", () => {
            setupJob(JobTerminateReason.JMComplete);

            expect(de.classes["success"]).toBe(true);
            expect(de.classes["error"]).toBe(false);

            expect(de.query(By.css(".fa-check-circle"))).not.toBeFalsy();
            expect(de.nativeElement.textContent).toContain("completed");
            expect(de.nativeElement.textContent).toContain("JMComplete");
        });

        it("show failure when job terminated with task failure", () => {
            setupJob(JobTerminateReason.TaskFailed);

            expect(de.classes["error"]).toBe(true);
            expect(de.classes["success"]).toBe(false);

            expect(de.query(By.css(".fa-warning"))).not.toBeFalsy();
            expect(de.nativeElement.textContent).toContain("completed");
            expect(de.nativeElement.textContent).toContain("TaskFailed");
        });

        it("show failure when job terminated with timeout", () => {
            setupJob(JobTerminateReason.MaxWallClockTimeExpiry);

            expect(de.classes["error"]).toBe(true);
            expect(de.classes["success"]).toBe(false);

            expect(de.query(By.css(".fa-warning"))).not.toBeFalsy();
            expect(de.nativeElement.textContent).toContain("completed");
            expect(de.nativeElement.textContent).toContain("MaxWallClockTimeExpiry");
        });
    });
});
