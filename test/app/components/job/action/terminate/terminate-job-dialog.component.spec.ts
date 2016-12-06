import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MdDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { AppModule } from "app/app.module";
import { TerminateJobDialogComponent } from "app/components/job/action";
import { BatchError } from "app/models";
import { JobService } from "app/services";

describe("TerminateJobDialogComponent ", () => {
    let fixture: ComponentFixture<TerminateJobDialogComponent>;
    let component: TerminateJobDialogComponent;
    let dialogRefSpy: any;
    let jobServiceSpy: any;
    let de: DebugElement;

    beforeEach(() => {
        dialogRefSpy = {
            close: jasmine.createSpy("DialogClose"),
        };

        jobServiceSpy = {
            terminate: jasmine.createSpy("TerminateJob").and.callFake((jobid, ...args) => {
                if (jobid === "bad-job-id") {
                    return Observable.throw(<BatchError>{
                        code: "RandomTestErrorCode",
                        message: { value: "Some random test error happened terminating job" },
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

        fixture = TestBed.createComponent(TerminateJobDialogComponent);
        component = fixture.componentInstance;
        component.jobId = "job-1";
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and job id", () => {
        expect(de.nativeElement.textContent).toContain("Terminate job");
        expect(de.nativeElement.textContent).toContain("job-1");
    });

    it("Submit should call service and close the dialog", () => {
        fixture.detectChanges();
        const submitBtn = de.query(By.css("button[color=warn]")).nativeElement;
        submitBtn.click();

        expect(jobServiceSpy.terminate).toHaveBeenCalledTimes(1);
        expect(jobServiceSpy.terminate).toHaveBeenCalledWith("job-1", {});
        expect(dialogRefSpy.close).toHaveBeenCalledTimes(1);
    });

    it("Submit should call service and show error if fail", () => {
        component.jobId = "bad-job-id";
        fixture.detectChanges();
        const submitBtn = de.query(By.css("button[color=warn]")).nativeElement;
        submitBtn.click();

        expect(jobServiceSpy.terminate).toHaveBeenCalledTimes(1);
        expect(jobServiceSpy.terminate).toHaveBeenCalledWith("bad-job-id", {});
        expect(dialogRefSpy.close).not.toHaveBeenCalled();

        fixture.detectChanges();
        expect(component.hasError()).toBe(true);
        const errorEl = de.query(By.css(".error")).nativeElement;

        expect(errorEl.textContent).toContain("Some random test error happened terminating job");
    });
});
