import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";
import { autobind } from "core-decorators";
import { AsyncSubject, Observable } from "rxjs";

import { BlobContainer } from "app/models";
import { GetContainerParams, StorageService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import "./cloud-file-picker-dialog.scss";

@Component({
    selector: "bl-cloud-file-picker-dialog",
    templateUrl: "cloud-file-picker-dialog.html",
})
export class CloudFilePickerDialogComponent {
    public container: BlobContainer;
    public data: RxEntityProxy<GetContainerParams, BlobContainer>;
    public done = new AsyncSubject();
    public pickedFile: string = null;

    private _saved = false;

    public set containerId(containerId: string) {
        this._containerId = containerId;
        this.data.params = { id: containerId };
        this.data.fetch();
    }

    private _containerId: string;

    constructor(private storageService: StorageService, public dialogRef: MdDialogRef<CloudFilePickerDialogComponent>) {
        this.data = this.storageService.getContainerProperties(null);
        this.data.item.subscribe((container) => {
            this.container = container;
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
        console.log("Closed called..");
        this.done.next(this._saved);
        this.done.complete();
    }
}
