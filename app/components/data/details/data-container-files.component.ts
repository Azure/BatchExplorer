import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { autobind } from "@batch-flask/core";
import * as path from "path";
import { Observable, Subscription, from } from "rxjs";

import { Activity, ActivityService } from "@batch-flask/ui";
import { NotificationService } from "@batch-flask/ui/notifications";
import { BlobFilesBrowserComponent } from "app/components/file/browse";
import { FileDropEvent } from "app/components/file/browse/file-explorer";
import { BlobContainer } from "app/models";
import { FileSystemService } from "app/services";
import { StorageBlobService, StorageContainerService } from "app/services/storage";
import { CloudPathUtils } from "app/utils";
import { map } from "rxjs/operators";

@Component({
    selector: "bl-data-container-files",
    templateUrl: "data-container-files.html",
})

export class DataContainerFilesComponent implements OnDestroy {
    @ViewChild("blobExplorer")
    public blobExplorer: BlobFilesBrowserComponent;

    @Input() public storageAccountId: string;
    @Input() public container: BlobContainer;

    private _onGroupUpdatedSub: Subscription;

    constructor(
        private fs: FileSystemService,
        private storageContainerService: StorageContainerService,
        private storageBlobService: StorageBlobService,
        private notificationService: NotificationService,
        private activityService: ActivityService) {

        this._onGroupUpdatedSub = this.storageContainerService.onContainerAdded.subscribe(() => {
            this.blobExplorer.refresh();
        });
    }

    public ngOnDestroy() {
        this._onGroupUpdatedSub.unsubscribe();
    }

    @autobind()
    public handleFileUpload(event: FileDropEvent): Observable<any> {
        const container = this.container.name;
        const initializer = () => {
            return from(this._getFilesToUpload(event.files)).pipe(
                map(fileList => {
                    return fileList.map(file => {
                        const filename = path.basename(file.localPath);
                        return new Activity(`Uploading ${filename} to ${container}`, () => {
                            return this.storageBlobService.uploadFile(
                                this.storageAccountId,
                                container,
                                file.localPath,
                                file.remotePath,
                            );
                        });
                    });
                }),
            );
        };

        const name = `Uploading ${event.files.length} files to ${container}`;
        const activity = new Activity(name, initializer);
        this.activityService.loadAndRun(activity);
        return activity.done;
    }

    private async _getFilesToUpload(files: any[]) {
        const result = [];
        for (const file of files) {
            const base = path.basename(file.path);
            const stats = await this.fs.lstat(file.path);
            if (stats.isFile()) {
                result.push({ localPath: file.path, remotePath: base });
            } else {

                const dirFiles = await this.fs.readdir(file.path);
                for (const dirFile of dirFiles) {
                    result.push({
                        localPath: path.join(file.path, dirFile),
                        remotePath: CloudPathUtils.join(base, CloudPathUtils.normalize(dirFile)),
                    });
                }
            }
        }
        return result;
    }
}
