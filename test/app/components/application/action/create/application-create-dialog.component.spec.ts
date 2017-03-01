import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { Observable, Subject } from "rxjs";

import { ApplicationCreateDialogComponent } from "app/components/application/action";
import { ApplicationModule } from "app/components/application/application.module";
import { NotificationService } from "app/components/base/notifications";
import { CreateFormComponent } from "app/components/base/form/create-form";
import { SidebarRef } from "app/components/base/sidebar";

import { Application, ServerError } from "app/models";
import { ApplicationService, HttpUploadService } from "app/services";
import { DataCache, RxBatchListProxy } from "app/services/core";
import { ControlValidator } from "test/app/components/validators";
import * as Fixtures from "test/fixture";
import * as TestConstants from "test/test-constants";

fdescribe("ApplicationCreateDialogComponent ", () => {
    let fixture: ComponentFixture<ApplicationCreateDialogComponent>;
    let component: ApplicationCreateDialogComponent;
    let debugElement: DebugElement;
    let applicationForm: any;
    let sidebarRefSpy: any;
    let appServiceSpy: any;
    let uploadServiceSpy: any;
    let notificationServiceSpy: any;

    const validators = TestConstants.validators;

    beforeEach(() => {
        sidebarRefSpy = {
            close: jasmine.createSpy("SidebarClose"),
        };

        appServiceSpy = {
            add: jasmine.createSpy("CreateJob").and.callFake((newJobJson, ...args) => {
                if (newJobJson.id === "bad-job-id") {
                    return Observable.throw(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    }));
                }

                return Observable.of({});
            }),

            onJobAdded: new Subject(),
        };

        uploadServiceSpy = { };

        notificationServiceSpy = { };

        TestBed.configureTestingModule({
            imports: [ApplicationModule],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: ApplicationService, useValue: appServiceSpy },
                { provide: HttpUploadService, useValue: uploadServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(ApplicationCreateDialogComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();

        applicationForm = component.applicationForm;
    });

    it("Should show title and description", () => {
        expect(debugElement.nativeElement.textContent).toContain("Create application package");
        expect(debugElement.nativeElement.textContent).toContain("Upload an application package"
            + " and give it an identifier to create your application");
    });

    describe("Application id", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("input[formControlName=id]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has required validation", () => {
            ControlValidator.validate(applicationForm, "id").fails(validators.required).with("");
            ControlValidator.validate(applicationForm, "id").passes(validators.required).with("bob");
        });

        it("control has maxLength validation", () => {
            ControlValidator.validate(applicationForm, "id").fails(validators.maxlength).with("a".repeat(65));
            ControlValidator.validate(applicationForm, "id").passes(validators.maxlength).with("a".repeat(64));
        });

        it("control has pattern validation", () => {
            ControlValidator.validate(applicationForm, "id").fails(validators.pattern).with("invalid app id");
            ControlValidator.validate(applicationForm, "id").passes(validators.pattern).with("valid-id");
        });
    });

    describe("Package version", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("input[formControlName=version]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has required validation", () => {
            ControlValidator.validate(applicationForm, "version").fails(validators.required).with("");
            ControlValidator.validate(applicationForm, "version").passes(validators.required).with("1");
        });

        it("control has maxLength validation", () => {
            ControlValidator.validate(applicationForm, "version").fails(validators.maxlength).with("a".repeat(65));
            ControlValidator.validate(applicationForm, "version").passes(validators.maxlength).with("a".repeat(64));
        });

        it("control has pattern validation", () => {
            ControlValidator.validate(applicationForm, "version").fails(validators.pattern).with("1 2 1");
            ControlValidator.validate(applicationForm, "version").passes(validators.pattern).with("1.2.1");
        });
    });

    describe("Package File", () => {
        it("control is initialized", () => {
            const input = debugElement.query(By.css("input[type=file]")).nativeElement;
            expect(input).toBeDefined();
        });

        it("control has required validation", () => {
            ControlValidator.validate(applicationForm, "package").fails(validators.required).with("");
            ControlValidator.validate(applicationForm, "package").passes(validators.required).with("bob.zip");
        });

        it("control has pattern validation", () => {
            ControlValidator.validate(applicationForm, "package").fails(validators.pattern).with("file.text");
            ControlValidator.validate(applicationForm, "package").passes(validators.pattern).with("file.zip");
        });
    });

    // it("Can patch poolId directly", () => {
    //     component.preSelectPool("pool-002");
    //     expect(poolForm.controls["poolId"].value).toEqual("pool-002");
    // });

    // it("Can clone job into form", () => {
    //     const job = Fixtures.job.create({ id: "job-001", poolInfo: { poolId: "pool-002" } });
    //     component.setValue(job);

    //     expect(baseForm.controls.id.value).toEqual("job-001");
    //     expect(baseForm.controls.displayName.value).toEqual("display name");
    //     expect(baseForm.controls.priority.value).toEqual(1);
    //     expect(constraintsForm.controls.maxTaskRetryCount.value).toEqual(3);
    //     expect(poolForm.controls.poolId.value).toEqual("pool-002");
    // });

    // it("Clicking add creates job and doesnt close form", () => {
    //     const job = Fixtures.job.create({ id: "job-001", poolInfo: { poolId: "pool-002" } });
    //     component.setValue(job);

    //     const createForm = de.query(By.css("bl-create-form")).componentInstance as CreateFormComponent;
    //     createForm.add();

    //     expect(jobServiceSpy.add).toHaveBeenCalledTimes(1);
    //     expect(sidebarRefSpy.close).toHaveBeenCalledTimes(0);

    //     let jobAddedCalled = false;
    //     jobServiceSpy.onJobAdded.subscribe({
    //         next: (newJobId) => {
    //             expect(newJobId).toEqual("job-001");
    //             jobAddedCalled = true;
    //         },
    //         complete: () => {
    //             expect(jobAddedCalled).toBe(true);
    //         },
    //     });
    // });

    // it("If create job throws we handle the error", () => {
    //     const job = Fixtures.job.create({ id: "bad-job-id", poolInfo: { poolId: "pool-002" } });
    //     component.setValue(job);

    //     const createForm = de.query(By.css("bl-create-form")).componentInstance as CreateFormComponent;
    //     createForm.add();

    //     expect(createForm.error).not.toBeNull();
    //     expect(createForm.error.body.code).toEqual("RandomTestErrorCode");
    //     expect(createForm.error.body.message).toEqual("error, error, error");

    //     let jobAddedCalled = false;
    //     jobServiceSpy.onJobAdded.subscribe({
    //         next: (newJobId) => {
    //             jobAddedCalled = true;
    //         },
    //         complete: () => {
    //             expect(jobAddedCalled).toBe(false);
    //         },
    //     });
    // });
});
