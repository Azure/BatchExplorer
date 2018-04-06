import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AccountService, StorageAccountService } from "app/services";
import { List } from "immutable";

import { StorageAccount } from "app/models";
import { AutoStorageService } from "app/services/storage";
import { Subscription } from "rxjs";
import "./storage-account-picker.scss";

@Component({
    selector: "bl-storage-account-picker",
    templateUrl: "storage-account-picker.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StorageAccountPickerComponent), multi: true },
    ],
})
export class StorageAccountPickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
    public autoStorageAccountId: string;
    public loading: boolean = true;
    public storageAccounts: List<StorageAccount>;
    public pickedStorageAccountId: string;
    private _propagateChange: (value: string) => void;
    private _sub: Subscription;
    private _storageAccounts: List<StorageAccount>;

    constructor(
        private autoStorageService: AutoStorageService,
        private batchAccountService: AccountService,
        private storageAccountService: StorageAccountService,
        private changeDetector: ChangeDetectorRef) {

        this._sub = this.autoStorageService.storageAccountId.subscribe((id) => {
            this.autoStorageAccountId = id;
            this._updateStorageAccounts();
        });
    }

    public ngOnInit() {
        this.batchAccountService.currentAccount.first().subscribe((currentAccount) => {
            this.storageAccountService.list(currentAccount.subscription.subscriptionId).subscribe((storageAccounts) => {
                this._storageAccounts = storageAccounts;
                this.loading = false;
                this._updateStorageAccounts();
            });
        });
    }

    public ngOnDestroy() {
        this._sub.unsubscribe();
    }

    public pickStorageAccountId(storageAccountId: string) {
        this.pickedStorageAccountId = storageAccountId;
        this.changeDetector.markForCheck();
        if (this._propagateChange) {
            this._propagateChange(storageAccountId);
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

    private _updateStorageAccounts() {
        let autoStorageAccount;
        const accounts = [];
        this._storageAccounts.forEach((account) => {
            if (account.id === this.autoStorageAccountId) {
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
