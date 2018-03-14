import { Component, Input, OnDestroy, OnInit,ChangeDetectionStrategy,ChangeDetectorRef,   forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { SidebarManager } from "@batch-flask/ui/sidebar";
import { FileGroupCreateFormComponent } from "app/components/data/action";
import { BlobContainer } from "app/models";
import { ListContainerParams, StorageService } from "app/services";
import { ListView } from "app/services/core";
import { Constants } from "common";

import "./blob-container-picker.scss";

@Component({
    selector: "bl-blob-container-picker",
    templateUrl: "blob-container-picker.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BlobContainerPickerComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => BlobContainerPickerComponent), multi: true },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlobContainerPickerComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    public containers: List<BlobContainer>;
    public value = new FormControl();
    public containersData: ListView<BlobContainer, ListContainerParams>;
    public warning = false;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];
    private _loading: boolean = true;

    constructor(private storageService: StorageService, changeDetector: ChangeDetectorRef) {

        this.containersData = this.storageService.containerListView();
        this.containersData.items.subscribe((containers) => {
            this.containers = containers;
            console.log("Containers", containers.toJS());
            changeDetector.markForCheck()
        });

        // listen to file group add events
        this._subscriptions.push(this.storageService.onContainerAdded.subscribe((fileGroupId: string) => {
            const container = storageService.getContainerOnce(fileGroupId);
            this.fileGroupsData.loadNewItem(container);
            container.subscribe((blobContainer) => {
                this._checkValid(blobContainer.name);
            });
        }));

        this._subscriptions.push(this.value.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value && value.replace(Constants.ncjFileGroupPrefix, ""));
            }
        }));
    }

    public ngOnInit() {
        this.containersData.fetchAll().subscribe(() => {
            console.log("Loaded all containers");
            this._loading = false;
            this._checkValid(this.value.value);
        });
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
        this.containersData.dispose();
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

    public trackContainer(index, container: BlobContainer) {
        return container.id;
    }

    private _checkValid(value: string) {
        const valid = this._loading || !value || this.containers.map(x => x.name).includes(value);
        this.warning = !valid;
    }
}
