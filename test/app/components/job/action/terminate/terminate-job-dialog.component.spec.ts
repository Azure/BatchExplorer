import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { Observable } from "rxjs";

import { TerminateJobDialogComponent } from "app/components/job/action";
import { ServerError } from "app/models";
import { JobService } from "app/services";
import { ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

describe("TerminateJobDialogComponent ", () => {
    let fixture: ComponentFixture<TerminateJobDialogComponent>;
    let component: TerminateJobDialogComponent;
    let dialogRefSpy: any;
    let jobServiceSpy: any;
    let debugElement: DebugElement;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("close"),
        };

        jobServiceSpy = {
            terminate: jasmine.createSpy("terminate").and.callFake((jobid, ...args) => {
                if (jobid === "bad-job-id") {
                    return Observable.throw(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened terminating job" },
                    }));
                }

                return Observable.of({});
            }),
        };

        TestBed.configureTestingModule({
            declarations: [
                SimpleFormMockComponent, TerminateJobDialogComponent, ServerErrorMockComponent,
            ],
            providers: [
                { provide: MdDialogRef, useValue: dialogRefSpy },
                { provide: JobService, useValue: jobServiceSpy },

            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TerminateJobDialogComponent);
        component = fixture.componentInstance;
        component.jobId = "job-1";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and job id", () => {
        expect(debugElement.nativeElement.textContent).toContain("Terminate job");
        expect(debugElement.nativeElement.textContent).toContain("job-1");
    });

    it("Submit should call service and close the dialog", (done) => {
        component.ok().subscribe(() => {
            expect(jobServiceSpy.terminate).toHaveBeenCalledTimes(1);
            expect(jobServiceSpy.terminate).toHaveBeenCalledWith("job-1");

            done();
        });
    });

    it("Submit should call service and show error if fail", (done) => {
        component.jobId = "bad-job-id";
        fixture.detectChanges();
        component.ok().subscribe({
            next: () => {
                fail("call should have failed");
                done();
            },
            error: (error: ServerError) => {
                expect(jobServiceSpy.terminate).toHaveBeenCalledTimes(1);
                expect(jobServiceSpy.terminate).toHaveBeenCalledWith("bad-job-id");
                expect(error.body.message).toBe("Some random test error happened terminating job");

                done();
            },
        });
    });
});
