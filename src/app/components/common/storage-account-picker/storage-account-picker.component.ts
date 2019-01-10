import {
    AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
    ContentChildren, OnDestroy, QueryList, forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SelectOptionComponent } from "@batch-flask/ui";
import { ArmBatchAccount, StorageAccount } from "app/models";
import { BatchAccountService, StorageAccountService } from "app/services";
import { AutoStorageService } from "app/services/storage";
import { List } from "immutable";
import { Subject, combineLatest } from "rxjs";
import { filter, switchMap, takeUntil } from "rxjs/operators";

import "./storage-account-picker.scss";

@Component({
    selector: "bl-storage-account-picker",
    templateUrl: "storage-account-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StorageAccountPickerComponent), multi: true },
    ],
})
export class StorageAccountPickerComponent implements AfterContentInit, OnDestroy, ControlValueAccessor {
    @ContentChildren(SelectOptionComponent)
    public additionalOptions: QueryList<SelectOptionComponent>;

    public loading: boolean = true;
    public storageAccounts: List<StorageAccount> = List([]);
    public pickedStorageAccountId: string;
    private _propagateChange: (value: string) => void;
    private _destroy = new Subject();

    constructor(
        private autoStorageService: AutoStorageService,
        private batchAccountService: BatchAccountService,
        private storageAccountService: StorageAccountService,
        private changeDetector: ChangeDetectorRef) {

        const storageAccounts = this.batchAccountService.currentAccount.pipe(
            takeUntil(this._destroy),
            filter(x => x instanceof ArmBatchAccount),
            switchMap((account: ArmBatchAccount) => {
                return this.storageAccountService.list(account.subscription.subscriptionId);
            }),
        );

        combineLatest(storageAccounts, this.autoStorageService.storageAccountId).pipe(
            takeUntil(this._destroy),
        ).subscribe(([storageAccounts, autoStorageAccountId]) => {
            this.loading = false;
            this._updateStorageAccounts(storageAccounts, autoStorageAccountId);
        });
    }

    public ngAfterContentInit() {
        this.additionalOptions.changes.subscribe(() => {
            this.changeDetector.markForCheck();
        });
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
    }

    public pickStorageAccountId(storageAccountId: string) {
        if (storageAccountId !== this.pickedStorageAccountId) {
            this.pickedStorageAccountId = storageAccountId;
            this.changeDetector.markForCheck();
            if (this._propagateChange) {
                this._propagateChange(storageAccountId);
            }
        }
    }

    public writeValue(value: string): void {
        this.pickedStorageAccountId = value && value.toLowerCase();
    }

    public registerOnChange(fn: (value: string) => void): void {
        this._propagateChange = fn;
    }

    public registerOnTouched(fn: any): void {
        // nothin now
    }

    public trackStorageAccount(index, storageAccount: StorageAccount) {
        return storageAccount.id;
    }

    public trackOption(index, option: SelectOptionComponent) {
        return option.value;
    }

    private _updateStorageAccounts(storageAccounts: List<StorageAccount>, autoStorageAccountId: string) {
        let autoStorageAccount;
        const accounts = [];
        storageAccounts.forEach((account) => {
            if (account.id === autoStorageAccountId) {
                autoStorageAccount = new StorageAccount({
                    ...account.toJS(),
                    name: `${account.name} (Auto storage)`,
                });
            } else {
                accounts.push(account);
            }
        });
        accounts.sortBy(x => x.name);
        if (autoStorageAccount) {
            accounts.unshift(autoStorageAccount);
        }
        this.storageAccounts = List(accounts);

        this.changeDetector.markForCheck();

    }
}
