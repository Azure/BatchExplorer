import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import * as moment from "moment";
import { Observable } from "rxjs";

import { JobDetailsModule, JobErrorDisplayComponent } from "app/components/job/details";
import { Job, JobState, JobTerminateReason } from "app/models";
import { JobService } from "app/services";
import * as Fixtures from "test/fixture";

@Component({
    template: `<bex-job-error-display jobId="job-1" [job]="job"></bex-job-error-display>`,
})
class TestJobErrorDisplayComponent {
    public job: Job;
}

describe("JobErrorDisplayComponent", () => {
    let fixture: ComponentFixture<TestJobErrorDisplayComponent>;
    let testComponent: TestJobErrorDisplayComponent;
    let component: JobErrorDisplayComponent;
    let accountServiceSpy: any;

    beforeEach(() => {
        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create()),
        };
        TestBed.configureTestingModule({
            imports: [JobDetailsModule, RouterTestingModule],
            declarations: [TestJobErrorDisplayComponent],
            providers: [
                { provide: JobService, useValue: null },
            ],
        });
        fixture = TestBed.createComponent(TestJobErrorDisplayComponent);
        testComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.css("bex-job-error-display")).componentInstance;
        fixture.detectChanges();
    });

    describe("when there is no error", () => {
        it("should not show anything", () => {
            expect(fixture.debugElement.query(By.css("bex-banner"))).toBeNull();
        });
    });

    describe("when job has TaskFailed terminate reason", () => {
        beforeEach(() => {
            testComponent.job = new Job({
                state: JobState.completed,
                executionInfo: {
                    terminateReason: JobTerminateReason.TaskFailed,
                },
            });
            fixture.detectChanges();
        });

        it("should have a failure exit code error", () => {
            expect(component.jobFailed).toBe(true);
            expect(component.jobTimeout).toBe(false);
        });

        it("should show 1 bex banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bex-banner")).length).toBe(1);
        });

        it("Should show task failed message", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain("Job was terminated because one task failed.");
        });

        it("should propose to list failed task as quickfix", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner")).componentInstance;
            expect(banner.fixMessage).toContain("View failed tasks");
        });
    });

    describe("when job has MaxWallClockTimeExpiry terminate reason", () => {
        beforeEach(() => {
            testComponent.job = new Job({
                state: JobState.completed,
                constraints: {
                    maxWallClockTime: moment.duration("PT2M"),
                },
                executionInfo: {
                    terminateReason: JobTerminateReason.MaxWallClockTimeExpiry,
                },
            });
            fixture.detectChanges();
        });

        it("should have a failure exit code error", () => {
            expect(component.jobFailed).toBe(false);
            expect(component.jobTimeout).toBe(true);
        });

        it("should show 1 bex banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bex-banner")).length).toBe(1);
        });

        it("Should show task failed message", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain("Job timed out after running for 2m 00s.");
        });
    });

    describe("when job has a scheduling error", () => {
        beforeEach(() => {
            testComponent.job = new Job({
                state: JobState.completed,
                constraints: {
                    maxWallClockTime: moment.duration("PT2M"),
                },
                executionInfo: {
                    schedulingError: {
                        code: "InvalidAutoPoolSettings",
                        category: "UserError",
                        message: "Auto pool has invalid settings",
                        details: [
                            { key: "some", value: "More info" },
                        ],
                    },
                },
            });
            fixture.detectChanges();
        });

        it("should have a failure exit code error", () => {
            expect(component.jobFailed).toBe(false);
            expect(component.jobTimeout).toBe(false);
        });

        it("should show 1 bex banner", () => {
            expect(fixture.debugElement.queryAll(By.css("bex-banner")).length).toBe(1);
        });

        it("Should show task failed message", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain("InvalidAutoPoolSettings");
            expect(banner.nativeElement.textContent).toContain("Auto pool has invalid settings");
        });

        it("Should show details", () => {
            const banner = fixture.debugElement.query(By.css("bex-banner"));
            expect(banner.nativeElement.textContent).toContain("some");
            expect(banner.nativeElement.textContent).toContain("More info");
        });
    });
});
