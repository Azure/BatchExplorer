import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { JobProgressStatusComponent } from "app/components/job/details/job-progress-status";
import { Job, Node, Pool, TaskState } from "app/models";
import { NodeService, PoolService } from "app/services";
import { click } from "test/utils/helpers";
import { RxMockEntityProxy, RxMockListProxy } from "test/utils/mocks";
import { GaugeMockComponent } from "test/utils/mocks/components";

@Component({
    template: `<bl-job-progress-status [job]="job" [poolId]="poolId"></bl-job-progress-status>`,
})
class TestComponent {
    public job: Job;

    public poolId: string;
}

describe("JobProgressStatusComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: JobProgressStatusComponent;
    let gaugeComponent: GaugeMockComponent;
    let testComponent: TestComponent;

    let de: DebugElement;
    let poolServiceSpy;
    let nodeServiceSpy;

    beforeEach(() => {
        poolServiceSpy = {
            get: () => new RxMockEntityProxy<any, Pool>(Pool, {
                item: new Pool({ id: "pool-1", maxTasksPerNode: 8, targetDedicated: 3 }),
            }),
        };

        nodeServiceSpy = {
            list: () => new RxMockListProxy<any, Node>(Node, {
                items: [
                    new Node({
                        id: "node-1",
                        recentTasks: [
                            { taskId: "running-1", taskState: TaskState.running, jobId: "job-1" },
                            { taskId: "running-2", taskState: TaskState.running, jobId: "job-1" },
                            { taskId: "completed-1", taskState: TaskState.completed, jobId: "job-1" },
                        ],
                    }),
                    new Node({
                        id: "node-2",
                        recentTasks: [
                            { taskId: "running-3", taskState: TaskState.running, jobId: "job-1" },
                            { taskId: "running-wrong-job", taskState: TaskState.running, jobId: "job-2" },
                            { taskId: "active-1", taskState: TaskState.active, jobId: "job-1" },
                        ],
                    }),
                    new Node({
                        id: "node-3", recentTasks: [
                            { taskId: "running-4", taskState: TaskState.running, jobId: "job-1" },
                        ],
                    }),
                ],
            }),
        };

        TestBed.configureTestingModule({
            declarations: [JobProgressStatusComponent, GaugeMockComponent, TestComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: NodeService, useValue: nodeServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-job-progress-status"));
        component = de.componentInstance;
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
        expect(gaugeComponent.value).toBe(5, "Should all task on pool");

        click(options[0]);
        fixture.detectChanges();
        expect(gaugeComponent.value).toBe(4, "Should only show job task again");
    });
});
