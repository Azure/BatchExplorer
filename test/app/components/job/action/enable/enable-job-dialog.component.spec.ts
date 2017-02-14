import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { AppModule } from "app/app.module";
import { ActionFormComponent } from "app/components/base/form/action-form";
import { EnableJobDialogComponent } from "app/components/job/action";
import { BatchError } from "app/models";
import { JobService } from "app/services";

describe("EnableJobDialogComponent ", () => {
    let fixture: ComponentFixture<EnableJobDialogComponent>;
    let component: EnableJobDialogComponent;
    let dialogRefSpy: any;
    let jobServiceSpy: any;
    let de: DebugElement;
    let actionForm: ActionFormComponent;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        jobServiceSpy = {
            enable: jasmine.createSpy("EnableJob").and.callFake((jobid, ...args) => {
                if (jobid === "bad-job-id") {
                    return Observable.throw(<BatchError>{
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened enabling job" },
                    });
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

        fixture = TestBed.createComponent(EnableJobDialogComponent);
        component = fixture.componentInstance;
        component.jobId = "job-1";
        de = fixture.debugElement;
        actionForm = de.query(By.css("bex-action-form")).componentInstance;
        fixture.detectChanges();
    });

    it("Should show title and job id", () => {
        expect(de.nativeElement.textContent).toContain("Enable job");
        expect(de.nativeElement.textContent).toContain("job-1");
    });

    it("Submit should call service and close the dialog", () => {
        actionForm.performActionAndClose();

        expect(jobServiceSpy.enable).toHaveBeenCalledTimes(1);
        expect(jobServiceSpy.enable).toHaveBeenCalledWith("job-1", {});
    });

    it("Submit should call service and show error if fail", () => {
        component.jobId = "bad-job-id";
        fixture.detectChanges();
        actionForm.performActionAndClose();

        expect(jobServiceSpy.enable).toHaveBeenCalledTimes(1);
        expect(jobServiceSpy.enable).toHaveBeenCalledWith("bad-job-id", {});

        fixture.detectChanges();

        expect(actionForm.error).not.toBeNull();
        expect(actionForm.error.body.message).toContain("Some random test error happened enabling job");
    });
});
