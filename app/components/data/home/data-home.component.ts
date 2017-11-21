import { Component, OnDestroy, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { StorageService } from "app/services";
import { Filter, FilterBuilder } from "app/utils/filter-builder";
import { SidebarManager } from "../../base/sidebar";
import { FileGroupCreateFormComponent } from "../action";

import { MatMenuTrigger } from "@angular/material";
import { DialogService } from "app/components/base/dialogs";
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
        private storageService: StorageService) {

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
        this.dialogService.prompt("Add a new file group", {
            prompt: (name) => this._createEmptyFileGroup(name),
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
        return this.storageService.createContainer(name);
    }
}
