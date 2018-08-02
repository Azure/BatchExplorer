import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material";
import { FilterBuilder } from "@batch-flask/core";
import { ListView } from "@batch-flask/core";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { FileGroupCreateFormComponent } from "app/components/data/action";
import { BlobContainer } from "app/models";
import { NcjFileGroupService } from "app/services";
import { AutoStorageService, ListContainerParams, StorageContainerService } from "app/services/storage";
import { Constants } from "common";
import { List } from "immutable";
import { Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";

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
    public fileGroupsData: ListView<BlobContainer, ListContainerParams>;
    public warning = false;

    private _propagateChange: (value: any) => void = null;
    private _subscriptions: Subscription[] = [];
    private _loading: boolean = true;

    constructor(
        private fileGroupService: NcjFileGroupService,
        private autoStorageService: AutoStorageService,
        private storageContainerService: StorageContainerService,
        private sidebarManager: SidebarManager) {

        this.fileGroupsData = this.storageContainerService.listView();

        this.fileGroupsData.items.subscribe((fileGroups) => {
            this.fileGroups = fileGroups;
        });

        // listen to file group add events
        this._subscriptions.push(this.storageContainerService.onContainerAdded.subscribe((fileGroupId: string) => {
            this.autoStorageService.get().subscribe((storageAccountId) => {
                const container = storageContainerService.get(storageAccountId, fileGroupId);
                this.fileGroupsData.loadNewItem(container);
                container.subscribe((blobContainer) => {
                    this._checkValid(blobContainer.name);
                });
            });
        }));

        this._subscriptions.push(this.value.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
        ).subscribe((value) => {
            this._checkValid(value);
            if (this._propagateChange) {
                this._propagateChange(value && this.fileGroupService.removeFileGroupPrefix(value));
            }
        }));
    }

    public ngOnInit() {
        this.autoStorageService.get().subscribe((storageAccountId) => {
            this.fileGroupsData.params = {
                storageAccountId,
            };
            this.fileGroupsData.setOptions({
                filter: FilterBuilder.prop("name").startswith(Constants.ncjFileGroupPrefix),
            });

            this.fileGroupsData.fetchAll().subscribe(() => {
                this._loading = false;
                this._checkValid(this.value.value);
            });
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

    public createFileGroup(event: MatOptionSelectionChange) {
        // isUserInput true when selected, false when not
        if (!event.source.value && event.isUserInput) {
            const sidebar = this.sidebarManager.open("Add a new file group", FileGroupCreateFormComponent);
            sidebar.afterCompletion.subscribe(() => {
                const newFileGroupName = sidebar.component.getCurrentValue().name;
                this.value.setValue(this.fileGroupService.addFileGroupPrefix(newFileGroupName));
            });
        }
    }

    public trackFileGroup(index, fileGroup: BlobContainer) {
        return fileGroup.id;
    }

    private _checkValid(value: string) {
        const valid = this._loading || !value || this.fileGroups.map(x => x.name).includes(value);
        this.warning = !valid;
    }
}
