import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { AccountService, StorageAccountService } from "app/services";
import { List } from "immutable";

import { StorageAccount } from "app/models";
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
export class StorageAccountPickerComponent implements OnInit, ControlValueAccessor {
    public loading: boolean = true;
    public storageAccounts: List<StorageAccount>;
    public pickedStorageAccountId: string;
    private _propagateChange: (value: string) => void;

    constructor(
        private batchAccountService: AccountService,
        private storageAccountService: StorageAccountService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnInit() {
        this.batchAccountService.currentAccount.first().subscribe((currentAccount) => {
            this.storageAccountService.list(currentAccount.subscription.subscriptionId).subscribe((storageAccounts) => {
                this.storageAccounts = storageAccounts;
                this.loading = false;
                this.changeDetector.markForCheck();
            });
        });
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
}
