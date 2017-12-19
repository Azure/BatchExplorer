import { Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { autobind } from "app/core";
import { Subscription } from "rxjs";

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
                    this.notificationService.success("Added files to group", message);
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
        const obs = this.storageService.deleteFilesFromContainer(this.container, files);
        obs.subscribe({
            complete: () => {
                // tslint:disable-next-line:max-line-length
                const message = `The files were successfully removed from the file group: ${this.container.name}`;
                this.notificationService.success("Removed files from group", message);
            },
        });
        return obs;
    }
}
