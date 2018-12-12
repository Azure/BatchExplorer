import { Component, DebugElement, Input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule, EntityCommandsListModule, I18nUIModule, SummaryCardComponent } from "@batch-flask/ui";
import {
    ArmBatchAccount,
    BatchAccount,
    BatchAccountProvisingState,
    LocalBatchAccount,
    PoolAllocationMode,
    Subscription,
} from "app/models";
import { AccountSummaryCardComponent } from "./account-summary-card.component";

const sub1 = new Subscription({
    id: "/subscriptions/sub-1",
    subscriptionId: "sub-1",
    displayName: "My sub 1",
});

const acc1 = new ArmBatchAccount({
    id: "/subscriptions/sub-1/resourceGroups/group-1/providers/Microsoft.Batch/batchaccounts/account-1",
    name: "account-test",
    location: "westus",
    type: "BatchAccount",
    properties: {
        accountEndpoint: "account-1.region.batch.azure.com",
        autoStorage: {
            storageAccountId: null,
            lastKeySync: null,
        },
        provisioningState: BatchAccountProvisingState.Succeeded,
        dedicatedCoreQuota: 40,
        lowPriorityCoreQuota: 50,
        poolQuota: 20,
        activeJobAndJobScheduleQuota: 30,
        poolAllocationMode: PoolAllocationMode.BatchService,
    },
    subscription: sub1,
});

@Component({
    template: `<bl-account-summary-card [account]="account"></bl-account-summary-card>`,
})
class TestComponent {
    public account: BatchAccount = acc1;
}

@Component({
    selector: "bl-account-quotas-card",
    template: "",
})
class AccountQuotasCardMockComponent {
    @Input() public account: BatchAccount;
}

@Component({
    selector: "bl-storage-account-card",
    template: "",
})
class StorageAccountCardMockComponent {
    @Input() public account: BatchAccount;
}

describe("AccountSummaryCardComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let titleEl: DebugElement;
    let detailsEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                I18nTestingModule,
                I18nUIModule,
                ButtonsModule,
                EntityCommandsListModule,
            ],
            declarations: [
                AccountSummaryCardComponent,
                TestComponent,
                SummaryCardComponent,
                AccountQuotasCardMockComponent,
                StorageAccountCardMockComponent,
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-account-summary-card"));
        fixture.detectChanges();

        titleEl = de.query(By.css("[summaryTitle]"));
        detailsEl = de.query(By.css("[summaryDetails]"));
    });

    describe("when account is Arm Account", () => {
        it("shows the batch account name", () => {
            expect(titleEl.nativeElement.textContent).toContain(acc1.name);
        });

        it("shows the batch account url", () => {
            expect(detailsEl.nativeElement.textContent).toContain(acc1.properties.accountEndpoint);
        });

        it("shows the subscription name", () => {
            expect(detailsEl.nativeElement.textContent).toContain(sub1.displayName);
        });

        it("shows the resource group name", () => {
            expect(detailsEl.nativeElement.textContent).toContain("group-1");
        });

        it("configure the account quotas card", () => {
            const quotasEl = de.query(By.css("bl-account-quotas-card"));
            expect(quotasEl).not.toBeFalsy();
            expect(quotasEl.componentInstance.account).toEqual(acc1);
        });

        it("configure the storage account card", () => {
            const storageAccountEl = de.query(By.css("bl-storage-account-card"));
            expect(storageAccountEl).not.toBeFalsy();
            expect(storageAccountEl.componentInstance.account).toEqual(acc1);
        });
    });

    describe("when account is Local Account", () => {
        beforeEach(() => {
            testComponent.account = new LocalBatchAccount({
                displayName: "My Local account",
                name: "some",
                url: "https://some.westus.batch.com",
            });
            fixture.detectChanges();
        });

        it("shows the batch account name", () => {
            expect(titleEl.nativeElement.textContent).toContain("some");
        });

        it("shows the batch account url", () => {
            expect(detailsEl.nativeElement.textContent).toContain("https://some.westus.batch.com");
        });

        it("shows the batch account url2", () => {
            expect(detailsEl.nativeElement.textContent).toContain("https://some.westus.batch.com");
        });
    });
});
