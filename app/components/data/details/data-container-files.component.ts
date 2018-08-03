import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { autobind } from "@batch-flask/core";
import { FileDropEvent, FileSystemService } from "@batch-flask/ui";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { NotificationService } from "@batch-flask/ui/notifications";
import { log } from "@batch-flask/utils";
import { BlobFilesBrowserComponent } from "app/components/file/browse";
import { BlobContainer } from "app/models";
import { StorageBlobService, StorageContainerService } from "app/services/storage";
import { CloudPathUtils } from "app/utils";
import * as path from "path";
import { Subscription, from } from "rxjs";
import { flatMap, shareReplay } from "rxjs/operators";

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
        private backgroundTaskService: BackgroundTaskService,
        private notificationService: NotificationService) {

        this._onGroupUpdatedSub = this.storageContainerService.onContainerAdded.subscribe(() => {
            this.blobExplorer.refresh();
        });
    }

    public ngOnDestroy() {
        this._onGroupUpdatedSub.unsubscribe();
    }

    @autobind()
    public handleFileUpload(event: FileDropEvent) {
        const container = this.container.name;
        return from(this._getFilesToUpload(event.files)).pipe(
            flatMap((files) => {
                const message = `Uploading ${files.length} files to ${container}`;
                return this.backgroundTaskService.startTask(message, (task) => {
                    const observable = this.storageBlobService.uploadFiles(this.storageAccountId,
                        this.container.name, files, event.path);
                    let lastData;
                    observable.subscribe({
                        next: (data) => {
                            lastData = data;
                            const { uploaded, total, current } = data;
                            const name = path.basename(current.localPath);
                            task.name.next(`Uploading ${name} to ${container} (${uploaded}/${total})`);
                            task.progress.next(data.uploaded / data.total * 100);
                        },
                        complete: () => {
                            task.progress.next(100);
                            const message = `${lastData.uploaded} files were successfully uploaded to the file group`;
                            this.notificationService.success("Added files to group", message);
                        },
                        error: (error) => {
                            log.error("Failed to create form group", error);
                        },
                    });

                    return observable;
                });
            }),
            shareReplay(1),
        );

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
