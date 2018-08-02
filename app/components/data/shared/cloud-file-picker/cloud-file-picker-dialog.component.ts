import { Component, OnInit } from "@angular/core";
import { MatCheckboxChange, MatDialogRef } from "@angular/material";
import { ServerError, autobind } from "@batch-flask/core";
import { FileExplorerConfig, FileExplorerSelectable } from "@batch-flask/ui";
import { BlobContainer } from "app/models";
import { EntityView } from "app/services/core";
import { GetContainerParams, StorageContainerService } from "app/services/storage";
import { AsyncSubject, of } from "rxjs";

import "./cloud-file-picker-dialog.scss";

@Component({
    selector: "bl-cloud-file-picker-dialog",
    templateUrl: "cloud-file-picker-dialog.html",
})
export class CloudFilePickerDialogComponent implements OnInit {
    public container: BlobContainer;
    public data: EntityView<BlobContainer, GetContainerParams>;
    public done = new AsyncSubject();
    public pickedFile: string = null;
    public containerError: ServerError;
    public wildcards: string = null;
    public pickedFilter: string = null;
    public recursiveFetch: boolean = false;
    public optionFilters: any[];

    public fileExplorerConfig: FileExplorerConfig = {
        showTreeView: false,
        selectable: FileExplorerSelectable.file,
    };

    public set storageAccountId(storageAccountId: string) {
        this._storageAccountId = storageAccountId;
        this._updateData();
    }
    public get storageAccountId() { return this._storageAccountId; }

    public set containerId(containerId: string) {
        this._containerId = containerId;
        this._updateData();
    }
    public get containerId() { return this._containerId; }

    private _saved = false;
    private _storageAccountId: string;
    private _containerId: string;

    constructor(
        private storageContainerService: StorageContainerService,
        public dialogRef: MatDialogRef<CloudFilePickerDialogComponent>) {

        this.data = this.storageContainerService.view();
        this.data.item.subscribe((container) => {
            this.container = container;
        });

        this.data.error.subscribe((error) => {
            this.containerError = error;
        });
    }

    public ngOnInit() {
        if (this.wildcards) {
            this.pickedFilter = this.wildcards;
            this.optionFilters = [
                { label: "All Files", value: "" },
                { label: `(${this.wildcards}) files`, value: this.wildcards },
            ];
        }
    }

    @autobind()
    public submit() {
        this._saved = true;
        return of(null);
    }

    public trackFilterOption(index, option: any) {
        return option.value;
    }

    public updatePickedFile(file: string) {
        this.pickedFile = file;
    }

    public pickSelectedFilter(filter: string) {
        this.pickedFilter = filter;
    }

    public fetchAllCheckChanged(event: MatCheckboxChange) {
        this.recursiveFetch = event.checked;
    }

    public close() {
        this.done.next(this._saved);
        this.done.complete();
    }

    private _updateData() {
        if (this.storageAccountId && this.containerId) {
            this.data.params = { storageAccountId: this.storageAccountId, id: this.containerId };
            this.data.fetch();
        }
    }
}
