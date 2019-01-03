import { Component, Input, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { ArmBatchAccount, StorageAccount } from "app/models";
import { StorageAccountService } from "app/services";
import { List } from "immutable";

import "./auto-storage-account-picker.scss";

@Component({
    selector: "bl-auto-storage-account-picker",
    templateUrl: "auto-storage-account-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoStorageAccountPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => AutoStorageAccountPickerComponent), multi: true },
    ],
})
export class AutoStorageAccountPickerComponent implements OnInit, ControlValueAccessor {
    public noSelectionKey = "-1";

    @Input() public account: ArmBatchAccount;

    public preferedAccounts: List<StorageAccount> = List([]);
    public otherAccounts: List<StorageAccount> = List([]);
    public loadingStatus = LoadingStatus.Loading;
    public pickedStorageAccountId: string;
    public pickedName: string;

    private _propagateChange: (value: string) => void;
    constructor(private storageAccountService: StorageAccountService) {

    }

    public ngOnInit() {
        this.storageAccountService.list(this.account.subscription.subscriptionId).subscribe((storageAccounts) => {
            this._processStorageAccounts(storageAccounts);
            this.loadingStatus = LoadingStatus.Ready;
        });
    }

    public writeValue(value: string) {
        this.pickedStorageAccountId = value ? value.toLowerCase() : this.noSelectionKey;

    }

    public registerOnChange(fn) {
        this._propagateChange = fn;
    }

    public registerOnTouched() {
        // Do nothing
    }

    public validate(c: FormControl) {
        return null;
    }

    public pickStorageAccount(storageAccountId: string) {
        const same = this.pickedStorageAccountId === storageAccountId;
        this.pickedStorageAccountId = storageAccountId;
        if (this._propagateChange && storageAccountId && !same) {
            if (storageAccountId === this.noSelectionKey) {
                this._propagateChange(null);
            } else {
                this._propagateChange(storageAccountId);
            }
        }
    }

    public clearSelection() {
        this.pickedStorageAccountId = null;
        if (this._propagateChange) {
            this._propagateChange(null);
        }
    }

    public trackByFn(index, account: StorageAccount) {
        return account.id;
    }

    private _processStorageAccounts(storageAccounts: List<StorageAccount>) {
        const prefered = [];
        const others = [];
        storageAccounts.forEach((account) => {
            if (account.location.toLowerCase() === this.account.location.toLowerCase()) {
                prefered.push(account);
            } else {
                others.push(account);
            }
        });

        this.preferedAccounts = List(prefered);
        this.otherAccounts = List(others);
    }
}
