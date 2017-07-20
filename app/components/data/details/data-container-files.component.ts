import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";

import { ContextMenu, ContextMenuItem } from "app/components/base/context-menu";
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

    public contextmenu(blob: any) {
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this._deleteBlob(blob) }),
        ]);
    }

    private _deleteBlob(blob: any) {
        // console.log("HANDLING _deleteBlob");
        // const dialogRef = this.dialog.open(DeleteContainerDialogComponent);
        // dialogRef.componentInstance.id = container.id;
        // dialogRef.componentInstance.name = container.name;
        // dialogRef.afterClosed().subscribe((obj) => {
        //     this.storageService.getContainerOnce(container.id);
        // });
    }
}
