import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { AppModule } from "app/app.module";
import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { BatchError } from "app/models";
import { JobService, PoolService } from "app/services";
import { RxListProxy } from "app/services/core";

fdescribe("JobCreateBasicDialogComponent ", () => {
    let fixture: ComponentFixture<JobCreateBasicDialogComponent>;
    let component: JobCreateBasicDialogComponent;
    let formBuilderSpy: any;
    let jobServiceSpy: any;
    let poolServiceSpy: any;
    let de: DebugElement;

    beforeEach(() => {
        formBuilderSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        jobServiceSpy = {
            add: jasmine.createSpy("CreateJob").and.callFake((newJobJson, ...args) => {
                return Observable.of({});
            }),
            onJobAdded: jasmine.createSpy("OnJobAdded").and.callFake((newJobid) => {
                // and error condition ...
                return Observable.of({});
            }),
        };

        poolServiceSpy = {
            list: jasmine.createSpy("ListPools").and.callFake((...args) => {
                return  Observable.of(List<Pool>());
            }),
        };

        TestBed.configureTestingModule({
            imports: [AppModule],
            providers: [
                { provide: FormBuilder, useValue: formBuilderSpy },
                { provide: JobService, useValue: jobServiceSpy },
                { provide: PoolService, useValue: poolServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(JobCreateBasicDialogComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and description", () => {
        expect(de.nativeElement.textContent).toContain("Create job");
        expect(de.nativeElement.textContent).toContain("Adds a job to the selected account");
    });

    // it("should update the model task action when changing radio options", () => {
    //     expect(component.taskAction).toEqual("requeue", "requeue by default");

    //     const terminateOption = de.query(By.css("md-radio-group > md-radio-button[value=terminate]"));
    //     expect(terminateOption).not.toBeNull();

    //     const label = terminateOption.query(By.css("label")).nativeElement;

    //     label.click();
    //     fixture.detectChanges();
    //     expect(fixture.componentInstance.taskAction).toEqual("terminate");
    // });

    // it("updating the task action should update the task action description", () => {
    //     const description = de.query(By.css("bex-info-box")).nativeElement;
    //     expect(description.textContent).toContain("Terminate running tasks and requeue them.");

    //     component.taskAction = "terminate";
    //     fixture.detectChanges();
    //     expect(description.textContent).toContain("Terminate running tasks. The tasks will not run again.");
    // });

    // it("Submit should call service and close the dialog", () => {
    //     component.taskAction = "terminate";
    //     fixture.detectChanges();
    //     const submitBtn = de.query(By.css("button[color=warn]")).nativeElement;
    //     submitBtn.click();

    //     expect(jobServiceSpy.disable).toHaveBeenCalledTimes(1);
    //     expect(jobServiceSpy.disable).toHaveBeenCalledWith("job-1", "terminate", {});
    //     expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
    // });

    // it("Submit should call service and show error if fail", () => {
    //     component.jobId = "bad-job-id";
    //     fixture.detectChanges();
    //     const submitBtn = de.query(By.css("button[color=warn]")).nativeElement;
    //     submitBtn.click();

    //     expect(jobServiceSpy.disable).toHaveBeenCalledTimes(1);
    //     expect(jobServiceSpy.disable).toHaveBeenCalledWith("bad-job-id", "requeue", {});
    //     expect(dialogRefSpy.close).not.toHaveBeenCalled();

    //     fixture.detectChanges();
    //     expect(component.hasError()).toBe(true);
    //     const errorEl = de.query(By.css(".error")).nativeElement;

    //     expect(errorEl.textContent).toContain("Some random test error happened disabling job");
    // });
});
