import { Component, Input, OnInit, forwardRef, ViewChild } from "@angular/core";
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatTooltip } from "@angular/material/tooltip";
import { ListSelection } from "@batch-flask/core";
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

    @ViewChild("classicTooltip") public classicTooltip: MatTooltip;
    @Input() public account: ArmBatchAccount;

    public preferedAccounts: List<StorageAccount> = List([]);
    public otherAccounts: List<StorageAccount> = List([]);
    public classicAccounts: Set<string> = new Set();
    public loadingStatus = LoadingStatus.Loading;
    public pickedStorageAccountId: string;
    public selectedStorageAccounts: Set<string> = new Set();
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
            if (account.isClassic) {
                this.classicAccounts.add(account.id.toLowerCase());
            }
        });

        this.preferedAccounts = List(prefered);
        this.otherAccounts = List(others);
    }

    /* Show classic tooltip when navigating with keyboard. The "Tab" key is also
     * when navigating into or out of the component.
     *
     * Note also that they keyboard event is fired AFTER the selection has been
     * updated so we can safely assume the selection is correct.
     *
     * TODO: A more robust solution at the SelectionList component might
     * triangulate both keyboard and selection events and allow sub-components
     * to define a custom handler.
     */
    onKeydown(event: KeyboardEvent) {
        this.classicTooltip.hide();
        if (event.key === "ArrowDown" || event.key === "ArrowUp" ||
            event.key === "Tab") {
            if (this.selectedStorageAccounts.size === 1) {
                const id = this.selectedStorageAccounts.values().next().value;
                if (this.classicAccounts.has(id)) {
                    this.classicTooltip.show();
                }
            }
        }
    }

    setStorageAccountSelection(selection: ListSelection) {
        this.selectedStorageAccounts = selection.keys;
    }
}
