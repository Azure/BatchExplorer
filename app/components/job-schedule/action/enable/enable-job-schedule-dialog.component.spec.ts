import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { Observable, of, throwError } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { EnableJobScheduleDialogComponent } from "app/components/job-schedule/action";
import { JobScheduleService } from "app/services";
import { ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

describe("EnableJobScheduleDialogComponent ", () => {
    let fixture: ComponentFixture<EnableJobScheduleDialogComponent>;
    let component: EnableJobScheduleDialogComponent;
    let dialogRefSpy: any;
    let jobScheduleServiceSpy: any;
    let debugElement: DebugElement;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        jobScheduleServiceSpy = {
            enable: jasmine.createSpy("EnableJobSchedule").and.callFake((jobScheduleId, ...args) => {
                if (jobScheduleId === "bad-job-schedule-id") {
                    return throwError(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened enabling job schedule" },
                    }));
                }

                return of({});
            }),
        };

        TestBed.configureTestingModule({
            declarations: [
                SimpleFormMockComponent, EnableJobScheduleDialogComponent, ServerErrorMockComponent,
            ],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: JobScheduleService, useValue: jobScheduleServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(EnableJobScheduleDialogComponent);
        component = fixture.componentInstance;
        component.jobScheduleId = "job-schedule-1";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and job schedule id", () => {
        expect(debugElement.nativeElement.textContent).toContain("Enable job schedule");
        expect(debugElement.nativeElement.textContent).toContain("job-schedule-1");
    });

    it("Submit should call service and close the dialog", (done) => {
        component.ok().subscribe(() => {
            expect(jobScheduleServiceSpy.enable).toHaveBeenCalledTimes(1);
            expect(jobScheduleServiceSpy.enable).toHaveBeenCalledWith("job-schedule-1", {});

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
                expect(jobScheduleServiceSpy.enable).toHaveBeenCalledTimes(1);
                expect(jobScheduleServiceSpy.enable).toHaveBeenCalledWith("bad-job-schedule-id", {});
                expect(error.status).toBe(408);
                expect(error.code).toBe("RandomTestErrorCode");
                expect(error.message).toBe("Some random test error happened enabling job schedule");

                done();
            },
        });
    });
});
