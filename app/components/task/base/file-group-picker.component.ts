import { Component, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormBuilder, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { List } from "immutable";
import { Subscription } from "rxjs";

import { BlobContainer, FileGroup } from "app/models";
import { ListContainerParams, StorageService } from "app/services";
import { RxListProxy } from "app/services/core";

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
    public fileGroups: FormControl;
    public data: RxListProxy<ListContainerParams, BlobContainer>;
    public groups: List<string>;

    private _propagateChange: (value: FileGroup[]) => void = null;
    private _subscriptions: Subscription[] = [];

    // TODO: handle no autostorage, hide file group control if account has no autostorage settings.

    constructor(
        private formBuilder: FormBuilder,
        private storageService: StorageService) {

        this.data = this.storageService.listContainers(storageService.ncjFileGroupPrefix);
        this._subscriptions.push(this.data.items.subscribe((fileGroupContainers) => {
            this.groups = List(fileGroupContainers.map((container) => container.name));
            console.log("GOT: ", this.groups);
        }));

        this.fileGroups = this.formBuilder.control([]);
        this._subscriptions.push(this.fileGroups.valueChanges.subscribe((files) => {
            if (this._propagateChange) {
                const mapped = this._mapFileGroupsFromForm(files);
                this._propagateChange(mapped);
            }
        }));
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._subscriptions.forEach(x => x.unsubscribe());
    }

    public writeValue(value: FileGroup[]) {
        if (value) {
            const unmapped = this._mapFileGroupsFromApi(value);
            this.fileGroups.setValue(unmapped);
        }
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

    // data in the table is flattened so turn it into correct objects
    private _mapFileGroupsFromForm(files: any): FileGroup[] {
        return files.map((file: any) => {
            return {
                source: {
                    fileGroup: file.fileGroup,
                    prefix: file.prefix,
                },
                filePath: file.filePath,
            };
        });
    }

    // data from the api needs to be flattened to display in the table
    private _mapFileGroupsFromApi(files: FileGroup[]): any[] {
        return files.map((file: FileGroup) => {
            return {
                fileGroup: file.source.fileGroup,
                prefix: file.source.prefix,
                filePath: file.filePath,
            };
        });
    }
}
