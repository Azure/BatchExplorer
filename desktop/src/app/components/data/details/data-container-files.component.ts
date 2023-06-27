import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { BlobFilesBrowserComponent } from "app/components/file/browse";
import { BlobContainer } from "app/models";
import { StorageContainerService } from "app/services/storage";
import { Subscription } from "rxjs";

@Component({
    selector: "bl-data-container-files",
    templateUrl: "data-container-files.html",
})
export class DataContainerFilesComponent implements OnDestroy {

    @ViewChild("blobExplorer", { static: false })
    public blobExplorer: BlobFilesBrowserComponent;

    @Input() public storageAccountId: string;
    @Input() public container: BlobContainer;

    private _onGroupUpdatedSub: Subscription;

    constructor(
        private storageContainerService: StorageContainerService) {

        this._onGroupUpdatedSub = this.storageContainerService.onContainerAdded.subscribe(() => {
            this.blobExplorer.refresh();
        });
    }

    public ngOnDestroy() {
        this._onGroupUpdatedSub.unsubscribe();
    }
}
