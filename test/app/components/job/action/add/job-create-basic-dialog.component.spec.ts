import { DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { Subject, of, throwError } from "rxjs";

import { ServerError } from "@batch-flask/core";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarRef } from "@batch-flask/ui/sidebar";
import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { Pool } from "app/models";
import { JobService, PoolService } from "app/services";
import * as Fixtures from "test/fixture";
import * as TestConstants from "test/test-constants";
import { validateControl } from "test/utils/helpers";
import { MockListView } from "test/utils/mocks";
import { ServerErrorMockComponent, complexFormMockComponents } from "test/utils/mocks/components";

describe("JobCreateBasicDialogComponent ", () => {
    let fixture: ComponentFixture<JobCreateBasicDialogComponent>;
    let component: JobCreateBasicDialogComponent;
    let debugElement: DebugElement;
    let poolListProxy: MockListView<Pool, {}>;
    let sidebarRefSpy: any;
    let jobServiceSpy: any;
    let poolServiceSpy: any;
    let notificationServiceSpy: any;
    let baseForm: any;
    let constraintsForm: any;

    const validators = TestConstants.validators;

    beforeEach(() => {
        poolListProxy = new MockListView(Pool, {
            cacheKey: "url",
            items: [
                Fixtures.pool.create({ id: "pool-001" }),
                Fixtures.pool.create({ id: "pool-002" }),
                Fixtures.pool.create({ id: "pool-003" }),
            ],
        });

        sidebarRefSpy = {
            close: jasmine.createSpy("close"),
        };

        jobServiceSpy = {
            add: jasmine.createSpy("add").and.callFake((newJobJson, ...args) => {
                if (newJobJson.id === "bad-job-id") {
                    return throwError(ServerError.fromBatch({
                        statusCode: 408,
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    }));
                }

                return of({});
            }),

            onJobAdded: new Subject(),
        };

        poolServiceSpy = {
            listView: () => poolListProxy,
            get: (poolId) => of(Fixtures.pool.create({
                id: poolId,
                virtualMachineConfiguration: {
                    containerConfiguration: {
                        type: "dockerCompatible",
                        containerImageNames: [
                            "busybox",
                        ],
                    },
                },
            })),
        };

        notificationServiceSpy = {
            success: jasmine.createSpy("success"),

            error: jasmine.createSpy("error"),
        };

        TestBed.configureTestingModule({
            declarations: [...complexFormMockComponents, JobCreateBasicDialogComponent, ServerErrorMockComponent],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: JobService, useValue: jobServiceSpy },
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },

            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(JobCreateBasicDialogComponent);
        component = fixture.componentInstance;
        debugElement = fixture.debugElement;
        fixture.detectChanges();

        baseForm = component.form;
        constraintsForm = component.constraintsGroup;
    });

    it("Should show title and description", () => {
        expect(debugElement.nativeElement.textContent).toContain("Create job");
    });

    it("JobId is initialized", () => {
        const control = baseForm.controls.id;
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("JobId has required, pattern, and maxLength validation", () => {
        validateControl(baseForm, "id").fails(validators.required).with("");
        validateControl(baseForm, "id").fails(validators.maxlength).with("a".repeat(65));
        validateControl(baseForm, "id").fails(validators.pattern).with("invalid job id");
        validateControl(baseForm, "id").passes(validators.pattern).with("valid-id");
    });

    it("DisplayName is initialized", () => {
        const control = baseForm.controls.displayName;
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("DisplayName has maxLength validation only", () => {
        const controlName = "displayName";
        validateControl(baseForm, controlName).fails(validators.maxlength).with("a".repeat(1025));
        validateControl(baseForm, controlName).passes(validators.required).with(null);
    });

    it("Priority is initialized", () => {
        const control = baseForm.controls.priority;
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("Priority has range validation only", () => {
        const controlName = "priority";
        validateControl(baseForm, controlName).passes(validators.required).with(null);
        validateControl(baseForm, controlName).fails(validators.range).with(-1001);
        validateControl(baseForm, controlName).fails(validators.range).with(1001);
        validateControl(baseForm, controlName).passes(validators.range).with(500);
    });

    it("MaxRetryCount is initialized", () => {
        const control = constraintsForm.controls.maxTaskRetryCount;
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("MaxRetryCount has range validation only", () => {
        const controlName = "maxTaskRetryCount";
        validateControl(constraintsForm, controlName).passes(validators.required).with(null);
        validateControl(constraintsForm, controlName).fails(validators.range).with(-2);
        validateControl(constraintsForm, controlName).fails(validators.range).with(101);
        validateControl(constraintsForm, controlName).passes(validators.range).with(1);
    });

    it("onAllTasksComplete and onTaskFailure are initialized", () => {
        const control = baseForm.controls;
        expect(control.onAllTasksComplete).not.toBeNull();
        expect(control.onTaskFailure).not.toBeNull();
    });

    it("Pool is initialized", () => {
        const control = baseForm.controls.poolInfo;
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("Pool has required validation only", () => {
        baseForm.patchValue({ poolInfo: { poolId: "my-pool" } });
        expect(baseForm.hasError(validators.required, ["poolInfo"])).toBe(false);

        baseForm.patchValue({ poolInfo: null });
        expect(baseForm.hasError(validators.required, ["poolInfo"])).toBe(true);
    });

    it("Can patch poolId directly", () => {
        component.preSelectPool("pool-002");
        expect(baseForm.controls.poolInfo.value).toEqual({ poolId: "pool-002" });
    });

    it("Can clone job into form", () => {
        const job = Fixtures.job.create({ id: "job-001", poolInfo: { poolId: "pool-002" } });
        component.setValueFromEntity(job);

        expect(baseForm.controls.id.value).toEqual("job-001");
        expect(baseForm.controls.displayName.value).toEqual("display name");
        expect(baseForm.controls.priority.value).toEqual(1);
        expect(constraintsForm.controls.maxTaskRetryCount.value).toEqual(3);
        expect(baseForm.controls.poolInfo.value).toEqual({ poolId: "pool-002" });
    });

    it("Clicking add creates job and doesnt close form", (done) => {
        const job = Fixtures.job.create({ id: "job-001", poolInfo: { poolId: "pool-002" } });
        component.setValueFromEntity(job);
        component.submit(component.getCurrentValue()).subscribe(() => {
            expect(jobServiceSpy.add).toHaveBeenCalledTimes(1);
            expect(notificationServiceSpy.success).toHaveBeenCalledTimes(1);
            expect(sidebarRefSpy.close).toHaveBeenCalledTimes(0);

            done();
        });

        let jobAddedCalled = false;
        jobServiceSpy.onJobAdded.subscribe({
            next: (newJobId) => {
                expect(newJobId).toEqual("job-001");
                jobAddedCalled = true;
            },
            complete: () => {
                expect(jobAddedCalled).toBe(true);
            },
        });
    });

    it("If create job throws we handle the error", (done) => {
        const job = Fixtures.job.create({ id: "bad-job-id", poolInfo: { poolId: "pool-002" } });
        component.setValueFromEntity(job);
        component.submit(component.getCurrentValue()).subscribe({
            next: () => {
                fail("call should have failed");
                done();
            },
            error: (error: ServerError) => {
                expect(error.message).toBe("error, error, error");
                expect(error.toString()).toBe("408 - error, error, error");

                done();
            },
        });

        jobServiceSpy.onJobAdded.subscribe({
            next: (appId) => {
                fail("onJobAdded should not have been called");
            },
        });
    });
});
