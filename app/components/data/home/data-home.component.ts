import { Component, OnDestroy, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { autobind } from "@bl-common/core";
import { Observable, Subscription } from "rxjs";

import { StorageService } from "app/services";
import { Constants, Filter, FilterBuilder, Property } from "common";
import { SidebarManager } from"@bl-common/ui/sidebar";
import { FileGroupCreateFormComponent } from "../action";

import { MatMenuTrigger } from "@angular/material";
import { BrowseLayoutComponent, BrowseLayoutConfig } from "@bl-common/ui/browse-layout";
import { DialogService } from "@bl-common/ui/dialogs";
import { BlobContainer } from "app/models";
import "./data-home.scss";

const containerTypes = [
    {
        name: "All",
        prefix: "",
    },
    {
        name: "File groups",
        prefix: Constants.ncjFileGroupPrefix,
    },
];

@Component({
    selector: "bl-data-home",
    templateUrl: "data-home.html",
})
export class DataHomeComponent implements OnDestroy {
    @ViewChild(MatMenuTrigger) public trigger: MatMenuTrigger;

    @ViewChild("layout")
    public layout: BrowseLayoutComponent;

    public containerTypes = containerTypes;
    public quickSearchQuery: string = "";
    public filter: Filter = FilterBuilder.none();
    public hasAutoStorage = true;
    public containerTypePrefix = new FormControl("");

    public layoutConfig: BrowseLayoutConfig = {
        mergeFilter: this._mergeFilter.bind(this),
    };
    private _autoStorageSub: Subscription;

    constructor(
        private sidebarManager: SidebarManager,
        private dialogService: DialogService,
        public storageService: StorageService) {

        this.containerTypePrefix.valueChanges.subscribe((prefix) => {
            this.layout.advancedFilterChanged(FilterBuilder.prop("id").startswith(prefix));
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

    public openEmptyContainerForm(fileGroup = false) {
        const validation = Constants.forms.validation;
        const type = fileGroup ? "file group" : "container";
        this.dialogService.prompt(`Create a new empty ${type}`, {
            prompt: (name) => this._createEmptyContainer(name, fileGroup),
            validator: [
                Validators.required,
                Validators.maxLength(validation.maxLength.fileGroup),
                Validators.pattern(validation.regex.fileGroup),
            ],
            asyncValidator: [
                this._validateContainerUnique(fileGroup ? Constants.ncjFileGroupPrefix : ""),
            ],
            validatorMessages: [
                { code: "required", message: `The ${type} name is a required field` },
                { code: "maxlength", message: `The ${type} name has a maximum length of 64 characters` },
                { code: "duplicateContainer", message: `A ${type} with this name already exist.` },
                // tslint:disable-next-line:max-line-length
                { code: "pattern", message: `The ${type} can contain any combination of lowercase alphanumeric characters including single hyphens` },
            ],
        });
    }

    public openFileGroupForm() {
        this.sidebarManager.open("Add a new file group", FileGroupCreateFormComponent);
    }

    public advancedFilterChanged(filter: Filter) {
        this._updateFilter();
    }

    public trackType(index, type) {
        return type.prefix;
    }

    private _updateFilter() {
        const prefix = this.containerTypePrefix.value || "";
        const search = this.quickSearchQuery || "";
        const query = prefix + search;
        if (query === "") {
            this.filter = FilterBuilder.none();
        } else {
            this.filter = FilterBuilder.prop("id").startswith(query);
        }
    }

    private _mergeFilter(quickSearch: Filter, advanced: Filter) {
        const prefix = this._getFilterValue(advanced);
        const search = this._getFilterValue(quickSearch);
        const query = prefix + search;
        if (query === "") {
            return FilterBuilder.none();
        } else {
            return FilterBuilder.prop("id").startswith(query);
        }
    }

    private _getFilterValue(filter: Filter): string {
        if (filter.isEmpty()) {
            return "";
        } else if (filter instanceof Property) {
            return filter.value;
        } else {
            return (filter.properties[0] as any).value;
        }
    }

    private _createEmptyContainer(name: string, fileGroup = false) {
        const prefix = fileGroup ? Constants.ncjFileGroupPrefix : "";
        const container = `${prefix}${name}`;
        const obs = this.storageService.createContainer(container);
        obs.subscribe({
            next: () => {
                this.storageService.onContainerAdded.next(container);
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
    private _validateContainerUnique(prefix = "") {
        return (control: FormControl) => {
            const containerName = `${prefix}${control.value}`;
            return Observable.of(null).debounceTime(500)
                .flatMap(() => this.storageService.getContainerOnce(containerName))
                .map((container: BlobContainer) => {
                    return {
                        duplicateContainer: {
                            valid: false,
                        },
                    };
                }).catch(() => Observable.of(null));
        };
    }
}
