import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { AppModule } from "app/app.module";
import { ActionFormComponent } from "app/components/base/form/action-form";
import { DisableJobDialogComponent } from "app/components/job/action";
import { ServerError } from "app/models";
import { JobService } from "app/services";

describe("DisableJobDialogComponent ", () => {
    let fixture: ComponentFixture<DisableJobDialogComponent>;
    let component: DisableJobDialogComponent;
    let dialogRefSpy: any;
    let jobServiceSpy: any;
    let de: DebugElement;
    let actionForm: ActionFormComponent;

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
            imports: [AppModule],
            providers: [
                { provide: MdDialogRef, useValue: dialogRefSpy },
                { provide: JobService, useValue: jobServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(DisableJobDialogComponent);
        component = fixture.componentInstance;
        component.jobId = "job-1";
        de = fixture.debugElement;
        actionForm = de.query(By.css("bl-action-form")).componentInstance;
        fixture.detectChanges();
    });

    it("Should show title and job id", () => {
        expect(de.nativeElement.textContent).toContain("Disable job");
        expect(de.nativeElement.textContent).toContain("job-1");
    });

    it("should update the model task action when changing radio options", () => {
        expect(component.taskAction).toEqual("requeue", "requeue by default");

        const terminateOption = de.query(By.css("md-radio-group > md-radio-button[value=terminate]"));
        expect(terminateOption).not.toBeNull();

        const label = terminateOption.query(By.css("label")).nativeElement;

        label.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.taskAction).toEqual("terminate");
    });

    it("updating the task action should update the task action description", () => {
        const description = de.query(By.css("bl-info-box")).nativeElement;
        expect(description.textContent).toContain("Terminate running tasks and requeue them.");

        component.taskAction = "terminate";
        fixture.detectChanges();
        expect(description.textContent).toContain("Terminate running tasks. The tasks will not run again.");
    });

    it("Submit should call service and close the dialog", () => {
        component.taskAction = "terminate";
        fixture.detectChanges();
        actionForm.performActionAndClose();

        expect(jobServiceSpy.disable).toHaveBeenCalledTimes(1);
        expect(jobServiceSpy.disable).toHaveBeenCalledWith("job-1", "terminate", {});
    });

    it("Submit should call service and show error if fail", () => {
        component.jobId = "bad-job-id";
        fixture.detectChanges();
        actionForm.performActionAndClose();

        expect(jobServiceSpy.disable).toHaveBeenCalledTimes(1);
        expect(jobServiceSpy.disable).toHaveBeenCalledWith("bad-job-id", "requeue", {});

        fixture.detectChanges();

        expect(actionForm.error).not.toBeNull();
    });
});
