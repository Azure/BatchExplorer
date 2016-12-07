import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MdDialogRef, MdInput } from "@angular/material";
import { By } from "@angular/platform-browser";
import { Observable } from "rxjs";

import { AppModule } from "app/app.module";
import { SidebarRef } from "app/components/base/sidebar";
import { JobCreateBasicDialogComponent } from "app/components/job/action";
import { BatchError, Pool } from "app/models";
import { JobService, PoolService } from "app/services";
import { DataCache, RxListProxy } from "app/services/core";

// just making test work for now. Need Tim's input
export class FakeListProxy {
    public hasMoreItems(): boolean {
        return false;
    }

    public fetchNext(): Promise<any> {
        return Promise.resolve({
            data: [],
        });
    }

    public clone(): FakeListProxy {
        return null;
    }
}

fdescribe("JobCreateBasicDialogComponent ", () => {
    let fixture: ComponentFixture<JobCreateBasicDialogComponent>;
    let component: JobCreateBasicDialogComponent;
    // let formBuilderSpy: any;
    let sidebarRefSpy: any;
    let jobServiceSpy: any;
    let poolServiceSpy: any;
    let de: DebugElement;

    beforeEach(() => {
        // formBuilderSpy = {
        //     // todo: unsure how this needs to work
        //     // update: might not even need it now ...
        //     group: jasmine.createSpy("FormGroup").and.callFake((controls: { [key: string]: any; }) => {
        //         // this doesnt work as it needs to set up the controls internally
        //         // https://github.com/angular/angular/blob/2.3.0-beta.0/modules/%40angular/forms/src/form_builder.ts
        //         return new FormGroup(controls);
        //     }),
        // };

        sidebarRefSpy = {
            close: jasmine.createSpy("SidebarClose"),
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
            // todo: actually return some pools
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
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it("Should show title and description", () => {
        expect(de.nativeElement.textContent).toContain("Create job");
        expect(de.nativeElement.textContent).toContain("Adds a job to the selected account");
    });

    it("JobId validation works as expected", () => {
        let input = de.query(By.css("md-input[formControlName=id]")).componentInstance as MdInput;
        input.value = "";
        fixture.detectChanges();
        let hasError = fixture.componentInstance.createJobForm.hasError("required", ["id"]);
        expect(hasError).toBe(true);

        input.value = "invalid job id";
        fixture.detectChanges();
        hasError = fixture.componentInstance.createJobForm.hasError("pattern", ["id"]);
        expect(hasError).toBe(true);

        input.value = "valid-id";
        fixture.detectChanges();
        hasError = fixture.componentInstance.createJobForm.hasError("pattern", ["id"]);
        expect(hasError).toBe(false);
    });

    /**
     * tests
     * =====
     * check that validation works
     * check i can create a job
     * check i can create a job with a pre-populated pool
     * check i can clone a job
     * check we handle and display any errors to the user
     * check that add and close closes the slideout
     * check that add doesnt close the form
     */
});
