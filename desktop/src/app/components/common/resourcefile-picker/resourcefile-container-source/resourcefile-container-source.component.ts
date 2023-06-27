import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output,
} from "@angular/core";
import { DialogService } from "@batch-flask/ui";
import { ResourceFileAttributes } from "app/models";
import { StorageUtils } from "app/utils";
import { ResourceFileCloudFileDialogComponent } from "../resourcefile-cloud-file-dialog";

import "./resourcefile-container-source.scss";

@Component({
    selector: "bl-resourcefile-container-source",
    templateUrl: "resourcefile-container-source.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceFileContainerSourceComponent implements OnChanges {
    @Input() public file: ResourceFileAttributes;
    @Output() public updateSource = new EventEmitter<ResourceFileAttributes>();

    public storageAccountName: string;
    public containerName: string;
    public prefix: string;

    constructor(private changeDetector: ChangeDetectorRef, private dialogService: DialogService) {

    }

    public ngOnChanges(changes) {
        if (changes.file) {
            this._update();
        }
    }

    public openEditDialog() {
        const ref = this.dialogService.open(ResourceFileCloudFileDialogComponent);
        ref.componentInstance.setFile(this.file);
        ref.afterClosed().subscribe((file) => {
            if (!file) { return; }
            delete file.filePath;
            this.file = file;
            this.changeDetector.markForCheck();
            this.updateSource.emit(file);
        });
    }

    private _update() {
        if (this.file.storageContainerUrl) {
            this._parseStorageContainerUrl(this.file.storageContainerUrl);
        } else if (this.file.autoStorageContainerName) {
            this.storageAccountName = "Auto storage";
            this.containerName = this.file.autoStorageContainerName;
        }
        this.prefix = this.file.blobPrefix;
    }

    private _parseStorageContainerUrl(url: string) {
        const result = StorageUtils.getContainerFromUrl(url);
        if (result) {
            this.storageAccountName = result.account;
            this.containerName = result.container;
        } else {
            this.storageAccountName = null;
            this.containerName = null;
        }
    }
}
