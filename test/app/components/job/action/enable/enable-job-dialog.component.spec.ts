import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { Observable } from "rxjs";

import { EnableJobDialogComponent } from "app/components/job/action";
import { ServerError } from "app/models";
import { JobService } from "app/services";
import { ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

describe("EnableJobDialogComponent ", () => {
    let fixture: ComponentFixture<EnableJobDialogComponent>;
    let component: EnableJobDialogComponent;
    let dialogRefSpy: any;
    let jobServiceSpy: any;
    let debugElement: DebugElement;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        jobServiceSpy = {
            enable: jasmine.createSpy("EnableJob").and.callFake((jobid, ...args) => {
                if (jobid === "bad-job-id") {
                    return Observable.throw(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened enabling job" },
                    }));
                }

                return Observable.of({});
            }),
        };

        TestBed.configureTestingModule({
            declarations: [
                SimpleFormMockComponent, EnableJobDialogComponent, ServerErrorMockComponent,
            ],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: JobService, useValue: jobServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(EnableJobDialogComponent);
        component = fixture.componentInstance;
        component.jobId = "job-1";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and job id", () => {
        expect(debugElement.nativeElement.textContent).toContain("Enable job");
        expect(debugElement.nativeElement.textContent).toContain("job-1");
    });

    it("Submit should call service and close the dialog", (done) => {
        component.ok().subscribe(() => {
            expect(jobServiceSpy.enable).toHaveBeenCalledTimes(1);
            expect(jobServiceSpy.enable).toHaveBeenCalledWith("job-1", {});

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
                expect(jobServiceSpy.enable).toHaveBeenCalledTimes(1);
                expect(jobServiceSpy.enable).toHaveBeenCalledWith("bad-job-id", {});
                expect(error.message).toBe("Some random test error happened enabling job");

                done();
            },
        });
    });
});
