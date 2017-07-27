import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { Observable, Subscription } from "rxjs";

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

    public value = new FormControl();
    public fileGroupsData: RxListProxy<ListContainerParams, BlobContainer>;
    public filteredOptions: Observable<string[]>;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];

    // TODO: handle no autostorage, hide file group control if account has no autostorage settings.

    constructor(private storageService: StorageService) {

        this.fileGroupsData = this.storageService.listContainers(storageService.ncjFileGroupPrefix);
        this.fileGroupsData.items.subscribe((fileGroupContainers) => {
            console.log("Con", fileGroupContainers.toJS());
        });

        this._subscriptions.push(this.value.valueChanges.subscribe((value) => {
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
    }

    public ngOnInit() {
        this.fileGroupsData.fetchNext();
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

}
