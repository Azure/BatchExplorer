import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material/dialog";
import { ServerError } from "@batch-flask/core";
import { TerminateJobScheduleDialogComponent } from "app/components/job-schedule/action";
import { JobScheduleService } from "app/services";
import { of, throwError } from "rxjs";
import { ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

describe("TerminateJobScheduleDialogComponent", () => {
    let fixture: ComponentFixture<TerminateJobScheduleDialogComponent>;
    let component: TerminateJobScheduleDialogComponent;
    let dialogRefSpy: any;
    let jobScheduleServiceSpy: any;
    let debugElement: DebugElement;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("close"),
        };

        jobScheduleServiceSpy = {
            terminate: jasmine.createSpy("terminate").and.callFake((jobScheduleId, ...args) => {
                if (jobScheduleId === "bad-job-schedule-id") {
                    return throwError(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened terminating job schedule" },
                    }));
                }
                return of({});
            }),
        };

        TestBed.configureTestingModule({
            declarations: [
                SimpleFormMockComponent, TerminateJobScheduleDialogComponent, ServerErrorMockComponent,
            ],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: JobScheduleService, useValue: jobScheduleServiceSpy },

            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TerminateJobScheduleDialogComponent);
        component = fixture.componentInstance;
        component.jobScheduleId = "job-schedule-1";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and job schedule id", () => {
        expect(debugElement.nativeElement.textContent).toContain("Terminate job schedule");
        expect(debugElement.nativeElement.textContent).toContain("job-schedule-1");
    });

    it("Submit should call service and close the dialog", (done) => {
        component.ok().subscribe(() => {
            expect(jobScheduleServiceSpy.terminate).toHaveBeenCalledTimes(1);
            expect(jobScheduleServiceSpy.terminate).toHaveBeenCalledWith("job-schedule-1");

            done();
        });
    });

    it("Submit should call service and show error if fail", (done) => {
        component.jobScheduleId = "bad-job-schedule-id";
        fixture.detectChanges();
        component.ok().subscribe({
            next: () => {
                fail("call should have failed");
                done();
            },
            error: (error: ServerError) => {
                expect(jobScheduleServiceSpy.terminate).toHaveBeenCalledTimes(1);
                expect(jobScheduleServiceSpy.terminate).toHaveBeenCalledWith("bad-job-schedule-id");
                expect(error.status).toBe(408);
                expect(error.code).toBe("RandomTestErrorCode");
                expect(error.message).toBe("Some random test error happened terminating job schedule");

                done();
            },
        });
    });
});
