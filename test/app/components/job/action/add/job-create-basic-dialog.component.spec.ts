import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MdInput } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable, Subject } from "rxjs";

import { AppModule } from "app/app.module";
import { CreateFormComponent } from "app/components/base/form/create-form";
import { SidebarRef } from "app/components/base/sidebar";
import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { BatchError, Pool } from "app/models";
import { JobService, PoolService } from "app/services";
import { DataCache, RxListProxy } from "app/services/core";
import { Constants } from "app/utils";

import { ComponentTestHelper } from "test/app/components/component-test-helper";
import * as Fixtures from "test/fixture";

// Just making test work for now. Need Tim's input to come up with a strategy for testing with proxy data.
export class FakeListProxy {
    public hasMoreItems(): boolean {
        return false;
    }

    public fetchNext(): Promise<any> {
        return Promise.resolve({
            data: [
                Fixtures.pool.create({ id: "pool-001" }),
                Fixtures.pool.create({ id: "pool-002" }),
                Fixtures.pool.create({ id: "pool-003" }),
            ],
        });
    }

    public clone(): FakeListProxy {
        return null;
    }
}

describe("JobCreateBasicDialogComponent ", () => {
    let fixture: ComponentFixture<JobCreateBasicDialogComponent>;
    let helper: ComponentTestHelper<JobCreateBasicDialogComponent>;
    let component: JobCreateBasicDialogComponent;
    let sidebarRefSpy: any;
    let jobServiceSpy: any;
    let poolServiceSpy: any;
    let de: DebugElement;
    let baseForm: any;
    let constraintsForm: any;
    let poolForm: any;

    const fieldNames = Constants.forms.fieldNames;
    const validators = Constants.forms.validators;

    beforeEach(() => {
        sidebarRefSpy = {
            close: jasmine.createSpy("SidebarClose"),
        };

        jobServiceSpy = {
            add: jasmine.createSpy("CreateJob").and.callFake((newJobJson, ...args) => {
                if (newJobJson.id === "bad-job-id") {
                    return Observable.throw(<BatchError>{
                        code: "RandomTestErrorCode",
                        message: { value: "error, error, error" },
                    });
                }

                return Observable.of({});
            }),
            onJobAdded: new Subject(),
        };

        poolServiceSpy = {
            list: jasmine.createSpy("ListPools").and.callFake((...args) => {
                const cache = new DataCache<Pool>();
                const proxy = new RxListProxy<{}, Pool>(Pool, {
                    cache: (params) => cache,
                    proxyConstructor: (params, options) => new FakeListProxy(),
                    initialOptions: {},
                });

                return proxy;
            }),
        };

        TestBed.configureTestingModule({
            imports: [AppModule],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: JobService, useValue: jobServiceSpy },
                { provide: PoolService, useValue: poolServiceSpy },

            ],
        });

        fixture = TestBed.createComponent(JobCreateBasicDialogComponent);
        helper = new ComponentTestHelper<JobCreateBasicDialogComponent>(fixture);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();

        baseForm = component.createJobForm;
        constraintsForm = component.constraintsGroup;
        poolForm = component.poolInfoGroup;
    });

    it("Should show title and description", () => {
        expect(de.nativeElement.textContent).toContain("Create job");
        expect(de.nativeElement.textContent).toContain("Adds a job to the selected account");
    });

    it("JobId is initialized", () => {
        let control = baseForm.controls[fieldNames.id];
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("JobId has required, pattern, and maxLength validation", () => {
        const controlName = fieldNames.id;
        const input = de.query(By.css("md-input[formControlName=id]")).componentInstance as MdInput;
        helper.expectValidation(baseForm, input, controlName, "", validators.required, true);
        helper.expectValidation(baseForm, input, controlName, "invalid job id", validators.pattern, true);
        helper.expectValidation(baseForm, input, controlName, "a".repeat(65), validators.maxlength, true);
        helper.expectValidation(baseForm, input, controlName, "valid-id", validators.pattern, false);
    });

    it("DisplayName is initialized", () => {
        let control = baseForm.controls[fieldNames.displayName];
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("DisplayName has maxLength validation only", () => {
        const controlName = fieldNames.displayName;
        const input = de.query(By.css("md-input[formControlName=displayName]")).componentInstance as MdInput;
        helper.expectValidation(baseForm, input, controlName, "a".repeat(1025), validators.maxlength, true);
        helper.expectValidation(baseForm, input, controlName, null, validators.required, false);
    });

    it("Priority is initialized", () => {
        const control = baseForm.controls[fieldNames.priority];
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("Priority has range validation only", () => {
        const controlName = fieldNames.priority;
        const input = de.query(By.css("md-input[formControlName=priority]")).componentInstance as MdInput;
        helper.expectValidation(baseForm, input, controlName, null, validators.required, false);
        helper.expectValidation(baseForm, input, controlName, -1001, validators.range, true);
        helper.expectValidation(baseForm, input, controlName, 1001, validators.range, true);
        helper.expectValidation(baseForm, input, controlName, 500, validators.range, false);
    });

    it("MaxRetryCount is initialized", () => {
        const control = constraintsForm.controls[fieldNames.maxTaskRetryCount];
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("MaxRetryCount has range validation only", () => {
        const controlName = fieldNames.maxTaskRetryCount;
        const input = de.query(By.css("md-input[formControlName=maxTaskRetryCount]")).componentInstance as MdInput;
        helper.expectValidation(constraintsForm, input, controlName, null, validators.required, false);
        helper.expectValidation(constraintsForm, input, controlName, -2, validators.range, true);
        helper.expectValidation(constraintsForm, input, controlName, 101, validators.range, true);
        helper.expectValidation(constraintsForm, input, controlName, 1, validators.range, false);
    });

    it("PoolId is initialized", () => {
        const control = poolForm.controls[fieldNames.poolId];
        expect(control).not.toBeNull();
        expect(control.validator).not.toBeNull();
    });

    it("PoolId has required validation only", () => {
        poolForm.patchValue({ poolId: "my-pool" });
        expect(poolForm.hasError(validators.required, [fieldNames.poolId])).toBe(false);

        poolForm.patchValue({ poolId: "" });
        expect(poolForm.hasError(validators.required, [fieldNames.poolId])).toBe(true);
    });

    it("Can patch poolId directly", () => {
        component.preSelectPool("pool-002");
        expect(poolForm.controls[fieldNames.poolId].value).toEqual("pool-002");
    });

    it("Can clone job into form", () => {
        const job = Fixtures.job.create({ id: "job-001", poolInfo: { poolId: "pool-002" } });
        component.setValue(job);

        expect(baseForm.controls[fieldNames.id].value).toEqual("job-001");
        expect(baseForm.controls[fieldNames.displayName].value).toEqual("display name");
        expect(baseForm.controls[fieldNames.priority].value).toEqual(1);
        expect(constraintsForm.controls[fieldNames.maxTaskRetryCount].value).toEqual(3);
        expect(poolForm.controls[fieldNames.poolId].value).toEqual("pool-002");
    });

    it("Clicking add creates job and doesnt close form", () => {
        const job = Fixtures.job.create({ id: "job-001", poolInfo: { poolId: "pool-002" } });
        component.setValue(job);

        const createForm = de.query(By.css("bex-create-form")).componentInstance as CreateFormComponent;
        createForm.add();

        expect(jobServiceSpy.add).toHaveBeenCalledTimes(1);
        expect(sidebarRefSpy.close).toHaveBeenCalledTimes(0);

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

    it("If create job throws we handle the error", () => {
        const job = Fixtures.job.create({ id: "bad-job-id", poolInfo: { poolId: "pool-002" } });
        component.setValue(job);

        const createForm = de.query(By.css("bex-create-form")).componentInstance as CreateFormComponent;
        createForm.add();

        expect(createForm.error).not.toBeNull();
        expect(createForm.error.code).toEqual("RandomTestErrorCode");
        expect(createForm.error.message.value).toEqual("error, error, error");

        let jobAddedCalled = false;
        jobServiceSpy.onJobAdded.subscribe({
            next: (newJobId) => {
                jobAddedCalled = true;
            },
            complete: () => {
                expect(jobAddedCalled).toBe(false);
            },
        });
    });
});
