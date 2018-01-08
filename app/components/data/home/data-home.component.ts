import { Component, OnDestroy, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { autobind } from "app/core";
import { Subscription } from "rxjs";

import { NcjFileGroupService, StorageService } from "app/services";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { FileGroupCreateFormComponent } from "../action";

import { MatMenuTrigger } from "@angular/material";
import { DialogService } from "app/components/base/dialogs";
import { BlobContainer } from "app/models";
import { Constants } from "common";
import "./data-home.scss";

@Component({
    selector: "bl-data-home",
    templateUrl: "data-home.html",
})
export class DataHomeComponent implements OnDestroy {
    @ViewChild(MatMenuTrigger) public trigger: MatMenuTrigger;

    public quickSearchQuery = new FormControl();
    public filter: Filter = FilterBuilder.none();
    public quickFilter: Filter = FilterBuilder.none();
    public hasAutoStorage = true;

    private _autoStorageSub: Subscription;

    constructor(
        private sidebarManager: SidebarManager,
        private dialogService: DialogService,
        private filegroupService: NcjFileGroupService,
        public storageService: StorageService) {

        this.quickSearchQuery.valueChanges.debounceTime(400).distinctUntilChanged().subscribe((query: string) => {
            if (query === "") {
                this.quickFilter = FilterBuilder.none();
            } else {
                this.quickFilter = FilterBuilder.prop("id").startswith(query);
            }

            this._updateFilter();
        });

        this._autoStorageSub = this.storageService.hasAutoStorage.subscribe((hasAutoStorage) => {
            this.hasAutoStorage = hasAutoStorage;
        });
    }

    public ngOnDestroy() {
        this._autoStorageSub.unsubscribe();
    }

    @autobind()
    public addFileGroup() {
        this.trigger.openMenu();
    }

    public openEmptyFileGroupForm() {
        const validation = Constants.forms.validation;

        this.dialogService.prompt("Add a new file group", {
            prompt: (name) => this._createEmptyFileGroup(name),
            validator: [
                Validators.required,
                Validators.maxLength(validation.maxLength.fileGroup),
                Validators.pattern(validation.regex.fileGroup),
            ],
            asyncValidator: [
                this._validateFileGroupName.bind(this),
            ],
            validatorMessages: [
                { code: "required", message: "The file group name is a required field" },
                { code: "maxlength", message: "The file group name has a maximum length of 64 characters" },
                { code: "duplicateFileGroup", message: "A file group with this name already exist." },
                // tslint:disable-next-line:max-line-length
                { code: "pattern", message: "The file group name can contain any combination of lowercase alphanumeric characters including single hyphens" },
            ],
        });
    }

    public openFileGroupForm() {
        this.sidebarManager.open("Add a new file group", FileGroupCreateFormComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this._updateFilter();
    }

    private _updateFilter() {
        this.filter = this.quickFilter;
    }

    private _createEmptyFileGroup(name: string) {
        const obs = this.filegroupService.createEmptyFileGroup(name);
        obs.subscribe({
            next: () => {
                this.storageService.onFileGroupAdded.next(this.storageService.fileGroupContainer(name));
            },
            error: () => null,
        });
        return obs;
    }

    /**
     * Async validator to check if a given file-group exists.
     * If it does exist then we inform the user that they will be modifying
     * the existing group and not creating a new one.
     */
    private _validateFileGroupName(control: FormControl): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const containerName = `${Constants.ncjFileGroupPrefix}${control.value}`;
                this.storageService.getContainerOnce(containerName).subscribe({
                    next: (container: BlobContainer) => {
                        resolve({
                            duplicateFileGroup: {
                                valid: false,
                            },
                        });
                    },
                    error: (error) => {
                        resolve(null);
                    },
                });
                // timeout for allowing the user to type more than one character.
                // async validation fires after every kepress.
            }, 500);
        });
    }
}
