import { Component, DebugElement, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { BehaviorSubject, Subject } from "rxjs";
import { Observable } from "rxjs/Observable";

import { MaterialModule } from "@batch-flask/core";
import { DialogService } from "@batch-flask/ui/dialogs";
import { NotificationService } from "@batch-flask/ui/notifications";
import { SidebarManager } from "@batch-flask/ui/sidebar";

import { FileGroupPickerComponent } from "app/components/data/shared";
import { CloudFilePickerComponent } from "app/components/data/shared/cloud-file-picker";
import { FileGroupSasComponent } from "app/components/data/shared/file-group-sas";
import { PoolPickerComponent } from "app/components/job/action/add";
import { ParameterInputComponent, SubmitNcjTemplateComponent } from "app/components/market/submit";
import { NcjJobTemplate, NcjParameterRawType, NcjPoolTemplate, NcjTemplateMode, Pool } from "app/models";
import { NcjSubmitService, NcjTemplateService, PoolService, StorageService, VmSizeService } from "app/services";
import { Constants } from "app/utils";

import * as Fixtures from "test/fixture";
import { MockListView } from "test/utils/mocks";
import { NoItemMockComponent } from "test/utils/mocks/components";

@Component({
    template: `
        <bl-submit-ncj-template
            title="test title"
            [jobTemplate]="jobTemplate"
            [poolTemplate]="poolTemplate">
        </bl-submit-ncj-template>
    `,
})
class TestComponent {
    public jobTemplate: NcjJobTemplate = {
        parameters: {
            poolId: {
                type: NcjParameterRawType.string,
                defaultValue: "test-pool",
                metadata: {},
            },
            inputData: {
                type: NcjParameterRawType.string,
                metadata: {
                    advancedType: "file-group",
                },
            },
            blendFile: {
                type: NcjParameterRawType.string,
                metadata: {
                    advancedType: "file-in-file-group",
                    dependsOn: "inputData",
                },
            },
        },
        job: {
            type: "Microsoft.Batch/batchAccounts/jobs",
            properties: {
                poolId: "[parameters('poolId')]",
                fileGroup: "[parameters('inputData')]",
                blendFile: "[parameters('blendFile')]",
            },
        },
    };

    public poolTemplate: NcjPoolTemplate = {
        parameters: {
            poolId: {
                type: NcjParameterRawType.string,
                metadata: {
                    description: "test pool data",
                },
            },
        },
        variables: null,
        pool: {
            id: "[parameters('poolId')]",
        },
    };
}

describe("SubmitNcjTemplateComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let component: SubmitNcjTemplateComponent;
    let de: DebugElement;

    let listProxy: MockListView<any, any>;
    let activatedRouteSpy: any;
    let templateServiceSpy: any;
    let ncjSubmitServiceSpy: any;
    let routerSpy: any;
    let storageServiceSpy: any;
    let poolServiceSpy: any;
    let vmSizeServiceSpy: any;
    let sidebarSpy: any;
    let dialogSpy: any;
    let notificationServiceSpy: any;

    const blendFile = "myscene.blend";
    const queryParameters = {
        "auto-pool": "0",
        "blendFile": blendFile,
    };

    beforeEach(() => {
        listProxy = new MockListView(Pool, {
            cacheKey: "id",
            items: [
                Fixtures.pool.create({ id: "pool-1" }),
            ],
        });

        activatedRouteSpy = {
            queryParams: new BehaviorSubject(queryParameters),
        };

        poolServiceSpy = {
            listView:  () => listProxy,
        };

        vmSizeServiceSpy = {
            sizes: Observable.of(List([])),
        };

        routerSpy = {
            navigate: jasmine.createSpy("router.navigate"),
            navigateByUrl: jasmine.createSpy("router.navigateByUrl"),
            createUrlTree: jasmine.createSpy("router.createUrlTree"),
        };

        templateServiceSpy = {
            addRecentSubmission: jasmine.createSpy("addRecentSubmission"),
        };

        ncjSubmitServiceSpy = {
            expandPoolTemplate: jasmine.createSpy("expandPoolTemplate").and.callFake((poolTemplate, poolParams) => {
                return Observable.of({});
            }),
            submitJob: jasmine.createSpy("submitJob").and.callFake((jobTemplate, jobParams) => {
                return Observable.of({});
            }),
            createPool: jasmine.createSpy("createPool").and.callFake((poolTemplate, poolParams) => {
                return Observable.of({});
            }),
        };

        storageServiceSpy = {
            onContainerAdded: new Subject(),
            containerListView: () => listProxy,
            addFileGroupPrefix: jasmine.createSpy("addFileGroupPrefix").and.callFake((fgName) => {
                return `${Constants.ncjFileGroupPrefix}${fgName}`;
            }),
        };

        dialogSpy = {
            open: jasmine.createSpy("open"),
        };

        sidebarSpy = {
            open: jasmine.createSpy("open"),
        };

        notificationServiceSpy = {
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error"),
        };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, ReactiveFormsModule, FormsModule, MaterialModule, NoopAnimationsModule],
            declarations: [NoItemMockComponent, SubmitNcjTemplateComponent, FileGroupSasComponent,
                TestComponent, FileGroupPickerComponent, CloudFilePickerComponent, ParameterInputComponent,
                PoolPickerComponent],
            providers: [
                { provide: FormBuilder, useValue: new FormBuilder() },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
                { provide: Router, useValue: routerSpy },
                { provide: NcjTemplateService, useValue: templateServiceSpy },
                { provide: NcjSubmitService, useValue: ncjSubmitServiceSpy },
                { provide: StorageService, useValue: storageServiceSpy },
                { provide: DialogService, useValue: dialogSpy },
                { provide: SidebarManager, useValue: sidebarSpy },
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: VmSizeService, useValue: vmSizeServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],

            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-submit-ncj-template"));
        component = de.componentInstance;
        fixture.detectChanges();
    });

    it("poolId should have been removed from the job template", () => {
        expect(testComponent.jobTemplate.parameters.poolId).toBe(undefined);
    });

    it("should set mode to pool picker mode due to initial query params", () => {
        expect(component.modeState).toBe(NcjTemplateMode.ExistingPoolAndJob);
    });

    it("should set blend file from query parameter", () => {
        expect(component.form.value.job.blendFile).toBe(blendFile);
        expect(component.jobParams.value.blendFile).toBe(blendFile);
    });

    describe("Change query parameter to not use autopool", () => {
        beforeEach(() => {
            queryParameters["auto-pool"] = "1";
            fixture = TestBed.createComponent(TestComponent);
            de = fixture.debugElement.query(By.css("bl-submit-ncj-template"));
            component = de.componentInstance;
            fixture.detectChanges();
        });

        it("should set mode to create auto-pool", () => {
            expect(component.modeState).toBe(NcjTemplateMode.NewPoolAndJob);
        });
    });
});
