import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { BackgroundTaskService } from "app/components/base/background-task";
import { NotificationService } from "app/components/base/notifications";
import { BlobFilesBrowserComponent } from "app/components/file/browse";
import { FileDropEvent } from "app/components/file/browse/file-explorer";
import { BlobContainer, File } from "app/models";
import { NcjFileGroupService, StorageService } from "app/services";
import { log } from "app/utils";

@Component({
    selector: "bl-data-container-files",
    templateUrl: "data-container-files.html",
})

export class DataContainerFilesComponent implements OnDestroy {
    @ViewChild("blobExplorer")
    public blobExplorer: BlobFilesBrowserComponent;

    @Input() public container: BlobContainer;

    private _onGroupUpdatedSub: Subscription;

    constructor(
        private storageService: StorageService,
        private backgroundTaskService: BackgroundTaskService,
        private notificationService: NotificationService,
        private fileGroupService: NcjFileGroupService) {

        this._onGroupUpdatedSub = this.storageService.onFileGroupUpdated.subscribe(() => {
            this.blobExplorer.refresh();
        });
    }

    public ngOnDestroy() {
        this._onGroupUpdatedSub.unsubscribe();
    }

    @autobind()
    public handleFileUpload(event: FileDropEvent) {
        const paths = event.files.map(x => x.path);
        return this.backgroundTaskService.startTask(`Upload files group ${this.container.name}`, (task) => {
            const observable = this.fileGroupService.addFilesToFileGroup(this.container.name, paths, event.path);
            let lastData;
            observable.subscribe({
                next: (data) => {
                    lastData = data;
                    task.progress.next(data.uploaded / data.total * 100);
                },
                complete: () => {
                    task.progress.next(100);
                    const message = `${lastData.uploaded} files were successfully uploaded to the file group`;
                    this.storageService.onFileGroupAdded.next(this.container.id);
                    this.notificationService.success("Added files to group", message, { persist: true });
                },
                error: (error) => {
                    log.error("Failed to create form group", error);
                },
            });

            return observable;
        });
    }

    @autobind()
    public handleFileDelete(files: File[]) {
        const fileCount = files.length;
        const taskTitle = `Delete ${fileCount} files from ${this.container.name}`;
        console.log(`handleFileDelete with ${fileCount} files`);

        // NOTE: Just pretending to delete the files at the moment as i need to check with the
        // storage team as to the best way to batch delete a heap of files as there could be lots
        // of them in a container.

        return this.backgroundTaskService.startTask(taskTitle, (task) => {
            let deleted = 0;
            let observable = Observable.interval(250).take(fileCount);
            observable.subscribe({
                next: (i) => {
                    deleted++;
                    console.log("deleting: ", this.container.id, files[i].name);
                    task.name.next(`${taskTitle} (${deleted}/${fileCount})`);
                    task.progress.next(deleted / fileCount * 100);
                },
                complete: () => {
                    task.progress.next(100);
                    // tslint:disable-next-line:max-line-length
                    const message = `${deleted} files were successfully removed from the file group: ${this.container.name}`;
                    this.notificationService.success("Removed files from group", message, { persist: true });
                },
                error: (error) => {
                    log.error("Failed to delete blobs", error);
                },
            });

            return observable;
        });
    }
}
