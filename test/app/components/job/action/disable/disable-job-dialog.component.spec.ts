import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { DisableJobDialogComponent } from "app/components/job/action";
import { ServerError } from "app/models";
import { JobService } from "app/services";
import { InfoBoxMockComponent, ServerErrorMockComponent, SimpleFormMockComponent } from "test/utils/mocks/components";

describe("DisableJobDialogComponent ", () => {
    let fixture: ComponentFixture<DisableJobDialogComponent>;
    let component: DisableJobDialogComponent;
    let debugElement: DebugElement;
    let dialogRefSpy: any;
    let jobServiceSpy: any;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        jobServiceSpy = {
            disable: jasmine.createSpy("DisableJob").and.callFake((jobid, ...args) => {
                if (jobid === "bad-job-id") {
                    return Observable.throw(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened disabling job" },
                    }));
                }

                return Observable.of({});
            }),
        };

        TestBed.configureTestingModule({
            declarations: [
                SimpleFormMockComponent, DisableJobDialogComponent, InfoBoxMockComponent, ServerErrorMockComponent,
            ],
            providers: [
                { provide: MdDialogRef, useValue: dialogRefSpy },
                { provide: JobService, useValue: jobServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(DisableJobDialogComponent);
        component = fixture.componentInstance;
        component.jobId = "job-1";
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and job id", () => {
        expect(debugElement.nativeElement.textContent).toContain("Disable job");
        expect(debugElement.nativeElement.textContent).toContain("job-1");
    });

    it("should update the model task action when changing radio options", () => {
        expect(component.taskAction).toEqual("requeue", "requeue by default");

        // TODO: this bit doesn't work after removeing the module
        // const radioGroup = debugElement.query(By.css("md-radio-group")).nativeElement as MdRadioGroup;
        // radioGroup.value = "terminate";
        // fixture.detectChanges();

        // expect(component.taskAction).toEqual("terminate");
    });

    it("updating the task action should update the task action description", () => {
        const description = debugElement.query(By.css("bl-info-box")).nativeElement;
        expect(description.textContent).toContain("Terminate running tasks and requeue them.");

        component.taskAction = "terminate";
        fixture.detectChanges();
        expect(description.textContent).toContain("Terminate running tasks. The tasks will not run again.");
    });

    it("Submit should call service and close the dialog", (done) => {
        component.taskAction = "terminate";
        fixture.detectChanges();

        component.ok().subscribe(() => {
            expect(jobServiceSpy.disable).toHaveBeenCalledTimes(1);
            expect(jobServiceSpy.disable).toHaveBeenCalledWith("job-1", "terminate", {});

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
                expect(jobServiceSpy.disable).toHaveBeenCalledTimes(1);
                expect(jobServiceSpy.disable).toHaveBeenCalledWith("bad-job-id", "requeue", {});

                expect(error.message).toBe("Some random test error happened disabling job");

                done();
            },
        });
    });
});
