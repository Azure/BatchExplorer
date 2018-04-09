import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatMenuTrigger } from "@angular/material";
import { Filter, FilterBuilder, Property, autobind } from "@batch-flask/core";
import { BrowseLayoutComponent, BrowseLayoutConfig } from "@batch-flask/ui/browse-layout";
import { DialogService } from "@batch-flask/ui/dialogs";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { Observable } from "rxjs";

import { BlobContainer } from "app/models";
import { AutoStorageService, StorageContainerService } from "app/services/storage";
import { Constants } from "common";
import { FileGroupCreateFormComponent } from "../action";

import { ActivatedRoute, Router } from "@angular/router";
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
export class DataHomeComponent implements OnInit {

    public static breadcrumb({ id }, { tab }) {
        return { name: "Storage containers" };
    }

    @ViewChild(MatMenuTrigger) public trigger: MatMenuTrigger;

    @ViewChild("layout")
    public layout: BrowseLayoutComponent;

    public fileGroupsId = "file-groups";
    public containerTypes = containerTypes;
    public quickSearchQuery: string = "";
    public filter: Filter = FilterBuilder.none();
    public hasAutoStorage = true;
    public containerTypePrefix = new FormControl("");
    public storageAccountId: string;

    /**
     * Can either be a storage account id or file-groups
     */
    public dataSource: string | "file-groups";

    public layoutConfig: BrowseLayoutConfig = {
        mergeFilter: this._mergeFilter.bind(this),
    };

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        private storageContainerService: StorageContainerService,
        private autoStorageService: AutoStorageService,
        private sidebarManager: SidebarManager,
        private dialogService: DialogService) {

        this.containerTypePrefix.valueChanges.subscribe((prefix) => {
            this.layout.advancedFilterChanged(FilterBuilder.prop("id").startswith(prefix));
        });
    }

    public ngOnInit() {
        this.activeRoute.params.subscribe((params) => {
            this.dataSource = params["dataSource"]
                || localStorage.getItem(Constants.localStorageKey.lastStorageAccount);
            if (!this.dataSource) {
                this.autoStorageService.get().subscribe((storageAccountId) => {
                    this._navigateToStorageAccount(storageAccountId);
                });
            } else {
                localStorage.setItem(Constants.localStorageKey.lastStorageAccount, this.dataSource);
                this.autoStorageService.getStorageAccountIdFromDataSource(this.dataSource)
                    .subscribe((storageAccountId) => {
                        this.storageAccountId = storageAccountId;
                        if (this.dataSource === this.fileGroupsId) {
                            this.containerTypePrefix.setValue(Constants.ncjFileGroupPrefix);
                        } else {
                            this.containerTypePrefix.setValue("");
                        }
                    });
            }
        });
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

    public updateDataSource(storageAccountId: string) {
        this._navigateToStorageAccount(storageAccountId);
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
        const obs = this.storageContainerService.create(this.storageAccountId, container);
        obs.subscribe({
            next: () => {
                this.storageContainerService.onContainerAdded.next(container);
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
                .flatMap(() => this.storageContainerService.get(this.storageAccountId, containerName))
                .map((container: BlobContainer) => {
                    return {
                        duplicateContainer: {
                            valid: false,
                        },
                    };
                }).catch(() => Observable.of(null));
        };
    }

    private _navigateToStorageAccount(storageAccountId: string) {
        this.router.navigate(["/data", storageAccountId, "containers"]);
    }
}
