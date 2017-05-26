import { Component, Input, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { List } from "immutable";

import { LoadingStatus } from "app/components/base/loading";
import { AccountResource, StorageAccount } from "app/models";
import { StorageAccountService } from "app/services";

import "./storage-account-picker.scss";

@Component({
    selector: "bl-storage-account-picker",
    templateUrl: "storage-account-picker.html",
    providers: [
        // tslint:disable:no-forward-ref
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StorageAccountPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => StorageAccountPickerComponent), multi: true },
    ],
})
export class StorageAccountPickerComponent implements OnInit, ControlValueAccessor {
    @Input()
    public account: AccountResource;

    public preferedAccounts: List<StorageAccount> = List([]);
    public otherAccounts: List<StorageAccount> = List([]);
    public loadingStatus = LoadingStatus.Loading;
    public pickedStorageAccountId: string;

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
        this.pickedStorageAccountId = value;
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
            this._propagateChange(storageAccountId);
        }
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
