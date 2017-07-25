import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";

import { PersistedFileListComponent } from "app/components/file/browse";
import { BlobContainer } from "app/models";
import { StorageService } from "app/services";

@Component({
    selector: "bl-data-container-files",
    templateUrl: "data-container-files.html",
})

export class DataContainerFilesComponent implements OnDestroy {
    @ViewChild("blobList")
    public blobList: PersistedFileListComponent;

    @Input()
    public container: BlobContainer;

    private _onGroupUpdatedSub: Subscription;

    constructor(private storageService: StorageService) {
        this._onGroupUpdatedSub = this.storageService.onFileGroupUpdated.subscribe(() => {
            this.blobList.refresh();
        });
    }

    public ngOnDestroy() {
        this._onGroupUpdatedSub.unsubscribe();
    }
}
