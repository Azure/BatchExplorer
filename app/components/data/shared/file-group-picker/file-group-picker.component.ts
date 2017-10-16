import { Component, Input, OnDestroy, OnInit, forwardRef } from "@angular/core";
import {
    ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR,
} from "@angular/forms";
<<<<<<< Updated upstream
import { autobind } from "core-decorators";
||||||| merged common ancestors
=======
import { MatOption } from "@angular/material";
>>>>>>> Stashed changes
import { List } from "immutable";
import { Subscription } from "rxjs";

import { SidebarManager } from "app/components/base/sidebar";
import { FileGroupCreateFormComponent } from "app/components/data/action";
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

    constructor(private storageService: StorageService, private sidebarManager: SidebarManager) {

        this.fileGroupsData = this.storageService.listContainers(storageService.ncjFileGroupPrefix);
        this.fileGroupsData.items.subscribe((fileGroups) => {
            this.fileGroups = fileGroups;
        });

        // listen to file group add events
        this._subscriptions.push(this.storageService.onFileGroupAdded.subscribe((fileGroupId: string) => {
            this.fileGroupsData.loadNewItem(storageService.getContainerOnce(fileGroupId));
        }));

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

<<<<<<< Updated upstream
    @autobind()
    public openCreateFileGroupDialog() {
        this.sidebarManager.open("Add a new file group", FileGroupCreateFormComponent);
    }

||||||| merged common ancestors
=======
    public picked(source: MatOption, isUserInput: boolean) {
        console.log("picked: ", !source.value && isUserInput);
    }

>>>>>>> Stashed changes
    private _checkValid(value: string) {
        const valid = this._loading || !value || this.fileGroups.map(x => x.name).includes(value);
        this.warning = !valid;
    }
}
