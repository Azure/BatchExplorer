import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { ServerError, autobind } from "@batch-flask/core";
import { AsyncSubject, Observable } from "rxjs";

import { FileExplorerConfig, FileExplorerSelectable } from "app/components/file/browse/file-explorer";
import { BlobContainer } from "app/models";
import { EntityView } from "app/services/core";
import { GetContainerParams, StorageContainerService } from "app/services/storage";
import "./cloud-file-picker-dialog.scss";

@Component({
    selector: "bl-cloud-file-picker-dialog",
    templateUrl: "cloud-file-picker-dialog.html",
})
export class CloudFilePickerDialogComponent {
    public container: BlobContainer;
    public data: EntityView<BlobContainer, GetContainerParams>;
    public done = new AsyncSubject();
    public pickedFile: string = null;
    public suffixFilter: string = null;
    public containerError: ServerError;

    public fileExplorerConfig: FileExplorerConfig = {
        showTreeView: false,
        selectable: FileExplorerSelectable.file,
    };

    private _saved = false;

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

    public updatePickedFile(file: string) {
        this.pickedFile = file;
    }

    @autobind()
    public submit() {
        this._saved = true;
        return Observable.of(null);
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
