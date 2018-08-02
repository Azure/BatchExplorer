import { Component, Input, OnChanges, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { ListView, autobind } from "@batch-flask/core";
import { BlobContainer } from "app/models";
import { AutoStorageService, ListContainerParams, StorageContainerService } from "app/services/storage";
import { Constants } from "common";
import { List } from "immutable";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

import "./file-group-sas.scss";

// tslint:disable:no-forward-ref
@Component({
    selector: "bl-file-group-sas",
    templateUrl: "file-group-sas.html",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileGroupSasComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => FileGroupSasComponent), multi: true },
    ],
})
export class FileGroupSasComponent implements ControlValueAccessor, OnChanges, OnInit, OnDestroy {
    @Input() public label: string;
    @Input() public hint: string;

    /**
     * Name of the file group from which to pick a file.
     */
    @Input() public containerId: string;

    /**
     * allow write access to the container, defaults to false
     */
    @Input() public allowWrite: boolean;

    public fileGroups: List<BlobContainer>;
    public value = new FormControl();
    public fileGroupsData: ListView<BlobContainer, ListContainerParams>;
    public warning = false;

    private _propagateChange: (value: any[]) => void = null;
    private _subscriptions: Subscription[] = [];

    constructor(
        private autoStorageService: AutoStorageService,
        private storageContainerService: StorageContainerService) {

        this.fileGroupsData = this.storageContainerService.listView();

        this.fileGroupsData.items.subscribe((fileGroups) => {
            this.fileGroups = fileGroups;
        });

        this._subscriptions.push(this.value.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value);
            }
        }));
    }

    public ngOnChanges(inputs) {
        if (this.containerId && inputs.containerId &&
            inputs.containerId.currentValue !== inputs.containerId.previousValue) {
            this.generateSasToken();
        } else {
            this.value.setValue(null);
        }
    }

    public ngOnInit() {
        this.autoStorageService.get().subscribe((storageAccountId) => {
            this.fileGroupsData.params = {
                storageAccountId,
            };
            this.fileGroupsData.setOptions({
                prefix: Constants.ncjFileGroupPrefix,
            });
            this.fileGroupsData.fetchNext();
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
        this.value.markAsTouched();
    }

    public validate(c: FormControl) {
        return null;
    }

    @autobind()
    public generateSasToken() {
        /**
         * Blob Container read/write/list access policy that is valid for 7 days, The maximum
         * lifetime of a task in Batch.
         */
        const accessPolicy = {
            AccessPolicy: {
                Permissions: this.allowWrite ? "rwl" : "rl",
                ResourceTypes: "CONTAINER",
                Services: "BLOB",
                Start: moment.utc().add(-15, "minutes").toDate(),
                Expiry: moment.utc().add(7, "day").toDate(),
            },
        };

        this.autoStorageService.get().subscribe((storageAccountId) => {
            this.storageContainerService.generateSharedAccessUrl(storageAccountId,
                this.containerId, accessPolicy).subscribe((value) => {
                    this.value.setValue(value);
                });
        });
    }

    private _checkValid(value: string) {
        const valid = !value || this.fileGroups.map(x => x.name).includes(value);
        this.warning = !valid;
    }
}
