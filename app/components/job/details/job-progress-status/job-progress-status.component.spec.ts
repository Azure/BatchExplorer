import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { PollService } from "@batch-flask/core";
import { Job, JobTaskCounts, JobTaskCountsValidationStatus, Node, Pool } from "app/models";
import { JobService, NodeService, PoolService } from "app/services";
import { of } from "rxjs";
import { click } from "test/utils/helpers";
import { MockEntityView, MockListView } from "test/utils/mocks";
import { GaugeMockComponent } from "test/utils/mocks/components";
import { JobProgressStatusComponent } from "./job-progress-status.component";

@Component({
    template: `<bl-job-progress-status [job]="job" [poolId]="poolId"></bl-job-progress-status>`,
})
class TestComponent {
    public job: Job;

    public poolId: string;
}

describe("JobProgressStatusComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let gaugeComponent: GaugeMockComponent;
    let testComponent: TestComponent;

    let de: DebugElement;
    let poolServiceSpy;
    let nodeServiceSpy;
    let jobServiceSpy;
    let pollServiceSpy;

    beforeEach(() => {
        poolServiceSpy = {
            view: () => new MockEntityView<any, Pool>(Pool, {
                item: new Pool({ id: "pool-1", maxTasksPerNode: 8, currentDedicatedNodes: 3 }),
            }),
        };

        nodeServiceSpy = {
            listView: () => new MockListView<Node, any>(Node, {
                items: [
                    new Node({ id: "node-1", runningTasksCount: 2 }),
                    new Node({ id: "node-2", runningTasksCount: 2 }),
                    new Node({ id: "node-3", runningTasksCount: 1 }),
                ],
            }),
        };

        jobServiceSpy = {
            getTaskCounts: jasmine.createSpy("getTaskCounts").and.callFake((jobId) => {
                const valid = jobId === "large-job"
                    ? JobTaskCountsValidationStatus.unvalidated
                    : JobTaskCountsValidationStatus.validated;

                return of(new JobTaskCounts({
                    running: 4,
                    completed: 8,
                    active: 12,
                    failed: 2,
                    succeeded: 6,
                    validationStatus: valid,
                }));
            }),
        };

        pollServiceSpy = {
            startPoll: () => ({ destroy: () => null }),
        };

        TestBed.configureTestingModule({
            declarations: [JobProgressStatusComponent, GaugeMockComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: NodeService, useValue: nodeServiceSpy },
                { provide: JobService, useValue: jobServiceSpy },
                { provide: PollService, useValue: pollServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-job-progress-status"));
        testComponent.poolId = "pool-1";
        testComponent.job = new Job({ id: "job-1" });
        fixture.detectChanges();

        gaugeComponent = de.query(By.css("bl-gauge")).componentInstance;
    });

    it("should give the right options to the gauge", () => {
        const options = gaugeComponent.options;
        expect(options.min).toBe(0);
        expect(options.max).toBe(3 * 8);
    });

    it("should give the right value to the gauge", () => {
        expect(gaugeComponent.value).toBe(4);
    });

    it("Show options to switch between job and pool tasks", () => {
        const options = de.queryAll(By.css(".toggle-job-pool-tasks > .option"));
        expect(options.length).toBe(2);
        expect(options[0].nativeElement.textContent).toContain("Only Job");
        expect(options[1].nativeElement.textContent).toContain("Pool");
    });

    it("click on pool button should show the total count of running task on the pool", () => {
        const options = de.queryAll(By.css(".toggle-job-pool-tasks > .option"));
        click(options[1]);
        fixture.detectChanges();
        expect(gaugeComponent.value).toBe(5, "Should count task on pool");

        click(options[0]);
        fixture.detectChanges();
        expect(gaugeComponent.value).toBe(4, "Should only show job task again");
    });

    it("should show queued count", () => {
        const el = de.query(By.css(".queued"));
        expect(el.nativeElement.textContent).toContain("12");
    });

    it("should show succeeded count", () => {
        const el = de.query(By.css(".completed .succeeded"));
        expect(el.nativeElement.textContent).toContain("6");
    });

    it("should show failed count", () => {
        const el = de.query(By.css(".completed .failed"));
        expect(el.nativeElement.textContent).toContain("2");
    });

    it("doesn't show warning if data is validated", () => {
        const warning =  de.query(By.css(".invalidated-data"));
        expect(warning).toBeFalsy();
    });

    it("show warning about task count validity if count is unvalidated", () => {
        testComponent.job = new Job({ id: "large-job" });
        fixture.detectChanges();

        const warning =  de.query(By.css(".invalidated-data"));
        expect(warning).not.toBeFalsy();
        expect(warning.nativeElement.textContent).toContain("Task count might not be accurate");
    });
});
