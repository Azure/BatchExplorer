import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { BlobContainer } from "app/models";
import { ListContainerParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";

import "./file-group-picker.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-file-group-picker",
    templateUrl: "file-group-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileGroupPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FileGroupPickerComponent), multi: true },
    ],
})
export class FileGroupPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public fileGroups: List<BlobContainer>;
    public value = new FormControl();
    public fileGroupsData: RxListProxy<ListContainerParams, BlobContainer>;
    public warning = false;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];
    private _loading: boolean = true;

    constructor(private storageService: StorageService) {

        this.fileGroupsData = this.storageService.listContainers(storageService.ncjFileGroupPrefix);
        this.fileGroupsData.items.subscribe((fileGroups) => {
            this.fileGroups = fileGroups;
        });

        this._subscriptions.push(this.value.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
    }

    public ngOnInit() {
        this.fileGroupsData.fetchAll().subscribe(() => {
            this._loading = false;
            this._checkValid(this.value.value);
        });
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
        this.fileGroupsData.dispose();
    }

    public writeValue(value: string) {
        this.value.setValue(value);
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

    private _checkValid(value: string) {
        const valid = this._loading || !value || this.fileGroups.map(x => x.name).includes(value);
        this.warning = !valid;
    }
}
