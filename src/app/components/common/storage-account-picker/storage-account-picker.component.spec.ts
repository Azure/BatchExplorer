import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { I18nUIModule, SelectComponent, SelectModule } from "@batch-flask/ui";
import { ArmBatchAccount, StorageAccount, Subscription } from "app/models";
import { BatchAccountService, StorageAccountService } from "app/services";
import { AutoStorageService } from "app/services/storage";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";
import { StorageAccountPickerComponent } from "./storage-account-picker.component";

@Component({
    template: `<bl-storage-account-picker [formControl]="control"></bl-storage-account-picker>`,
})
class TestComponent {
    public control = new FormControl<string>(null);
}

const sub1 = new Subscription({
    id: "/subscriptions/sub1",
    subscriptionId: "sub1",
});

const sub2 = new Subscription({
    id: "/subscriptions/sub2",
    subscriptionId: "sub2",
});

const storageAcc1 = new StorageAccount({
    id: "/storage/acc-1",
    name: "acc-1",
} as any);

const storageAcc2 = new StorageAccount({
    id: "/storage/acc-2",
    name: "acc-2",
} as any);
const storageAcc3 = new StorageAccount({
    id: "/storage/acc-3",
    name: "acc-3",
} as any);

describe("StorageAccountPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let de: DebugElement;
    let select: SelectComponent;

    let autoStorageServiceSpy;
    let batchAccountServiceSpy;
    let storageAccountServiceSpy;

    beforeEach(() => {
        autoStorageServiceSpy = {
            storageAccountId: new BehaviorSubject(storageAcc2.id),
        };
        batchAccountServiceSpy = {
            currentAccount: new BehaviorSubject(new ArmBatchAccount({
                id: "/subscriptions/sub1/batchAccounts/acc-1",
                subscription: sub1,
                name: "acc-1",
                location: "westus2",
                properties: {} as any,
            })),
        };
        storageAccountServiceSpy = {
            list: jasmine.createSpy("list").and.returnValue(of(List([storageAcc1, storageAcc2, storageAcc3]))),
        };
        TestBed.configureTestingModule({
            imports: [SelectModule, FormsModule, ReactiveFormsModule, I18nTestingModule, I18nUIModule],
            declarations: [StorageAccountPickerComponent, TestComponent],
            providers: [
                { provide: AutoStorageService, useValue: autoStorageServiceSpy },
                { provide: StorageAccountService, useValue: storageAccountServiceSpy },
                { provide: BatchAccountService, useValue: batchAccountServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-storage-account-picker"));
        fixture.detectChanges();

        select = de.query(By.directive(SelectComponent)).componentInstance;
    });

    it("it has one option per storage account returned and has auto storage account first", () => {
        const options = select.options.toArray();
        expect(options.length).toEqual(3);

        expect(options[0].label).toEqual("acc-2 (Auto storage)");
        expect(options[0].value).toEqual("/storage/acc-2");

        expect(options[1].label).toEqual("acc-1");
        expect(options[1].value).toEqual("/storage/acc-1");

        expect(options[2].label).toEqual("acc-3");
        expect(options[2].value).toEqual("/storage/acc-3");
    });

    it("propagte the changes when selecting an account", () => {
        const options = select.options.toArray();
        expect(options.length).toEqual(3);
        select.selectOption(options[1]);
        fixture.detectChanges();
        expect(testComponent.control.value).toEqual("/storage/acc-1");
    });

    it("pass the value down", async () => {
        testComponent.control.setValue("/storage/acc-2");
        fixture.detectChanges();
        await Promise.resolve(); // Wait for ngModel
        await Promise.resolve(); // Wait for ngModel
        expect(select.value).toEqual("/storage/acc-2");
    });

    it("updates the list of storage accounts when current batch account changes", () => {
        expect(storageAccountServiceSpy.list).toHaveBeenCalledTimes(1);
        expect(storageAccountServiceSpy.list).toHaveBeenCalledWith(sub1.subscriptionId);
        batchAccountServiceSpy.currentAccount.next(new ArmBatchAccount({
            id: "/subscriptions/sub2/batchAccounts/acc-2",
            subscription: sub2,
            name: "acc-1",
            location: "westus2",
            properties: {} as any,
        }) );

        expect(storageAccountServiceSpy.list).toHaveBeenCalledTimes(2);
        expect(storageAccountServiceSpy.list).toHaveBeenCalledWith(sub2.subscriptionId);

    });
});
