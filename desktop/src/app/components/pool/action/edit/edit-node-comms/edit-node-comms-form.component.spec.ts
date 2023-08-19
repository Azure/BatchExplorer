import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { FormModule, SidebarRef } from "@batch-flask/ui";
import { fromIso } from "@azure/bonito-core";
import { AbstractAction } from "@azure/bonito-core/lib/action";
import { Form, StringParameter } from "@azure/bonito-core/lib/form";
import { createReactForm } from "@azure/bonito-ui";
import { getAllByRole, getByLabelText, getByRole, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { initMockDesktopEnvironment } from "app/environment/mock-desktop-environment";
import { ArmBatchAccount, ArmSubscription, BatchAccountProvisingState, Pool, PoolAllocationMode } from "app/models";
import { BatchAccountService, PoolService, ThemeService } from "app/services";
import { BehaviorSubject, of } from "rxjs";
import { runAxe } from "test/utils/helpers/axe-helpers";
import { NotificationServiceMock } from "test/utils/mocks";
import { ReactActionFormComponent } from "../../../../common/react-action-form";
import { ReactContainerComponent } from "../../../../common/react-container";
import { EditNodeCommsFormComponent } from "./edit-node-comms-form.component";

describe("EditNodeCommsFormComponent", () => {
    const sub1 = new ArmSubscription({
        id: "/subscriptions/00000000-0000-0000-0000-000000000000",
        subscriptionId: "00000000-0000-0000-0000-000000000000",
    });

    let fixture: ComponentFixture<EditNodeCommsFormComponent>;
    let component: EditNodeCommsFormComponent;
    let de: DebugElement;

    let sidebarRefSpy;
    let themeServiceSpy;
    let notificationServiceSpy: NotificationServiceMock;
    let poolServiceSpy;
    let batchAccountServiceSpy;

    beforeEach(() => {
        initMockDesktopEnvironment();

        sidebarRefSpy = {};
        themeServiceSpy = {
            currentTheme: new BehaviorSubject({}),
        };
        notificationServiceSpy = new NotificationServiceMock();
        poolServiceSpy = {
            get: jasmine.createSpy("get").and.returnValue(of(null)),
        };
        batchAccountServiceSpy = {
            currentAccount: of(new ArmBatchAccount({
                id: `/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo`,
                name: "hobo",
                location: "eastus",
                properties: {
                    accountEndpoint: "mercury.eastus.batch.azure.com",
                    // nodeManagementEndpoint: "1234321.eastus.service.batch.azure.com",
                    provisioningState: BatchAccountProvisingState.Succeeded,
                    poolAllocationMode: PoolAllocationMode.BatchService,
                    dedicatedCoreQuota: 10000,
                    lowPriorityCoreQuota: 20000,
                    poolQuota: 50,
                    activeJobAndJobScheduleQuota: 100,
                    autoStorage: {
                        storageAccountId: `/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Storage/storageAccounts/storageA`,
                        lastKeySync: fromIso("2023-03-10T23:48:38.9878479Z"),
                    },
                    // publicNetworkAccess: "Enabled",
                },
                subscription: sub1
            })),
        };

        TestBed.configureTestingModule({
            imports: [
                I18nTestingModule,
            ],
            declarations: [
                ReactContainerComponent,
                ReactActionFormComponent,
                EditNodeCommsFormComponent,
            ],
            providers: [
                { provide: SidebarRef, useValue: sidebarRefSpy },
                { provide: ThemeService, useValue: themeServiceSpy },
                notificationServiceSpy.asProvider(),
                { provide: PoolService, useValue: poolServiceSpy },
                { provide: BatchAccountService, useValue: batchAccountServiceSpy },
            ],
        });

        fixture = TestBed.createComponent(EditNodeCommsFormComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        component.pool = new Pool({ id: "hobopool1" });

        fixture.detectChanges();
    });

    it("can render and submit", async () => {
        const user = userEvent.setup();
        await waitForRender();

        const el: HTMLElement = de.nativeElement;

        // Disabled textbox showing current state and dropdown
        // to select a new state
        const currentModeTextBox = getByRole(el, "textbox", {
            name: "lib.react.pool.parameter.currentNodeCommunicationMode.label"
        });
        const targetModeComboBox = getByRole(el, "combobox", {
            name: "lib.react.pool.parameter.targetNodeCommunicationMode.label"
        });

        // Save and cancel
        expect(getAllByRole(el, "button").length).toBe(2);

        const saveButton = getByRole(el, "button", {
            name: "bonito.core.save"
        });
        expect(saveButton).toBeTruthy();

        // Assert initial state of spies before save
        expect(notificationServiceSpy.success).not.toHaveBeenCalled();
        expect(poolServiceSpy.get).not.toHaveBeenCalled();

        await user.click(saveButton);
        await component.action.waitForExecution();
        expect(component.action.form.validationStatus?.level).toEqual("ok");

        // Pool should now have been refreshed and a success notification
        // should have been sent
        expect(notificationServiceSpy.success).toHaveBeenCalledOnce();
        expect(poolServiceSpy.get).toHaveBeenCalledOnce();
    });

    it("should pass accessibility test", async () => {
        await waitForRender();
        expect(await runAxe(de.nativeElement)).toHaveNoViolations();
    });

    async function waitForRender(): Promise<void> {
        await waitFor(() => {
            expect(getByLabelText(de.nativeElement, "lib.react.pool.parameter.currentNodeCommunicationMode.label")).toBeTruthy();
        });
    }

});
