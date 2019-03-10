import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogRef } from "@angular/material";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { ToolbarModule } from "@batch-flask/ui";
import { QuickListTestingModule } from "@batch-flask/ui/testing";
import { ArmBatchAccount, ArmSubscription } from "app/models";
import { BatchAccountService } from "app/services";
import { List } from "immutable";
import { BehaviorSubject } from "rxjs";
import { click } from "test/utils/helpers";
import { LocationModule } from "../../location";
import { SelectAccountDialogComponent } from "./select-account-dialog.component";

const sub1 = new ArmSubscription({
    id: "/subscriptions/sub-1",
    subscriptionId: "sub-1",
    displayName: "My sub 1",
});

const acc1 = new ArmBatchAccount({
    id: "/subscriptions/sub-1/resourceGroups/group-1/providers/Microsoft.Batch/batchaccounts/account-test-1",
    name: "account-test-1",
    location: "westus",
    type: "BatchAccount",
    properties: {
        autoStorage: {
            storageAccountId: null,
            lastKeySync: null,
        },
    } as any,
    subscription: sub1,
});

const acc2 = new ArmBatchAccount({
    id: "/subscriptions/sub-1/resourceGroups/group-1/providers/Microsoft.Batch/batchaccounts/account-test-2",
    name: "account-test-2",
    location: "westus",
    type: "BatchAccount",
    properties: {
        accountEndpoint: "account-1.region.batch.azure.com",
        autoStorage: {
            storageAccountId: "/subscriptions/sub-1/storage/storage-1",
            lastKeySync: null,
        },
    } as any,
    subscription: sub1,
});

describe("SelectAccountDialogComponent", () => {
    let fixture: ComponentFixture<SelectAccountDialogComponent>;
    let de: DebugElement;

    let accountServiceSpy;
    let dialogRefSpy;

    beforeEach(() => {
        accountServiceSpy = {
            accounts: new BehaviorSubject(List([acc1, acc2])),
            selectAccount: jasmine.createSpy("selectAccount"),
        };

        dialogRefSpy = {
            close: jasmine.createSpy("dialogRef.close"),
        };

        TestBed.configureTestingModule({
            imports: [
                ToolbarModule, QuickListTestingModule, LocationModule, ElectronTestingModule, RouterTestingModule,
            ],
            declarations: [SelectAccountDialogComponent],
            providers: [
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: MatDialogRef, useValue: dialogRefSpy },
            ],
        });
        fixture = TestBed.createComponent(SelectAccountDialogComponent);
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it("show all the accounts", () => {
        const rows = de.queryAll(By.css("bl-quick-list-row-render"));
        expect(rows.length).toEqual(2);
        expect(rows[0].nativeElement.textContent).toContain("account-test-1");
        expect(rows[1].nativeElement.textContent).toContain("account-test-2");
    });

    it("select an account when clicking on it", () => {
        const rows = de.queryAll(By.css("bl-quick-list-row-render"));
        expect(rows.length).toEqual(2);
        click(rows[1]);

        expect(dialogRefSpy.close).toHaveBeenCalledOnce();
        expect(dialogRefSpy.close).toHaveBeenCalledWith(acc2.id);

        expect(accountServiceSpy.selectAccount).toHaveBeenCalledOnce();
        expect(accountServiceSpy.selectAccount).toHaveBeenCalledWith(acc2.id);
    });
});
