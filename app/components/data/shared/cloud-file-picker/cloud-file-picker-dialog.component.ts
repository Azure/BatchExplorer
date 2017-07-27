import { Component } from "@angular/core";

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
    public set containerId(containerId: string) {
        console.log("Got containerid", containerId);

        this._containerId = containerId;
        this.data.params = { id: containerId };
        this.data.fetch();
    }

    private _containerId: string;

    constructor(private storageService: StorageService) {
        this.data = this.storageService.getContainerProperties(null);
        this.data.item.subscribe((container) => {
            console.log("Got container", container);
            this.container = container;
        });
    }
}
