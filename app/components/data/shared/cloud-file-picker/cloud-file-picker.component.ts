import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { autobind } from "core-decorators";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { DialogService } from "app/components/base/dialogs";
import { BlobContainer } from "app/models";
import { ListContainerParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";
import { CloudFilePickerDialogComponent } from "./cloud-file-picker-dialog.component";
import "./cloud-file-picker.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-cloud-file-picker",
    templateUrl: "cloud-file-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CloudFilePickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => CloudFilePickerComponent), multi: true },
    ],
})
export class CloudFilePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    /**
     * Name of the file group from which to pick a file.
     */
    @Input() public containerId: string;

    public fileGroups: List<BlobContainer>;
    public value = new FormControl();
    public fileGroupsData: RxListProxy<ListContainerParams, BlobContainer>;
    public warning = false;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];

    constructor(private storageService: StorageService, private dialog: DialogService) {

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
        this.value.markAsTouched();
    }

    public validate(c: FormControl) {
        return null;
    }

    @autobind()
    public openFilePickerDialog() {
        const ref = this.dialog.open(CloudFilePickerDialogComponent);
        const component = ref.componentInstance;
        component.containerId = this.containerId;
        component.pickedFile = this.value.value;
        component.done.subscribe((save) => {
            if (save) {
                this.value.setValue(component.pickedFile);
            }
        });
        return component.done;
    }

    private _checkValid(value: string) {
        const valid = !value || this.fileGroups.map(x => x.name).includes(value);
        this.warning = !valid;
    }
}
