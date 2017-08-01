import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MdDialogRef } from "@angular/material";
import { List } from "immutable";
import * as path from "path";
import { AsyncSubject, Observable } from "rxjs";

import { BackgroundTask, BackgroundTaskService } from "app/components/base/background-task";
import { ElectronShell, FileSystemService, StorageService } from "app/services";
import { SecureUtils } from "app/utils";
import { autobind } from "core-decorators";
import * as minimatch from "minimatch";
import "./download-file-group-dialog.scss";

@Component({
    selector: "bl-download-file-group-dialog",
    templateUrl: "download-file-group-dialog.html",
})
export class DownloadFileGroupDialogComponent {
    public set containerId(containerId: string) {
        this._containerId = containerId;
    }
    public get containerId() { return this._containerId; }

    public patterns = new FormControl("**/*");
    public downloadFolder = new FormControl("");
    private _containerId: string;

    constructor(
        public dialogRef: MdDialogRef<DownloadFileGroupDialogComponent>,
        private storageService: StorageService,
        private backgroundTaskService: BackgroundTaskService,
        private fs: FileSystemService,
        private shell: ElectronShell,
    ) {
        this.downloadFolder.setValue(this._defaultDownloadFolder);
    }

    @autobind()
    public startDownload() {
        this._startDownloadAsync();
        return Observable.of({});
    }

    public updateDownloadFolder(folder: string) {
        this.downloadFolder.setValue(folder);
    }

    private async _startDownloadAsync() {
        const folder = await this._getDownloadFolder();

        this.backgroundTaskService.startTask("Download file group", (task: BackgroundTask) => {
            const subject = new AsyncSubject();
            task.progress.next(1);
            this._getListOfFilesToDownload().subscribe((files) => {
                task.progress.next(10);
                const downloadObs = this._downloadFiles(task, folder, files);
                Observable.combineLatest(downloadObs).subscribe(() => {
                    this.shell.showItemInFolder(folder);
                    subject.complete();
                });
            });

            return subject.asObservable();
        });
    }

    private _getPatterns(): string[] {
        return this.patterns.value.split("\n");
    }

    private _getDownloadFolder(): Promise<string> {
        const folder = path.join(this.downloadFolder.value, this._containerId);
        if (this.downloadFolder.value === this._defaultDownloadFolder) {
            return this.fs.exists(folder).then((exists) => {
                if (exists) {
                    return `${folder}_${SecureUtils.uuid()}`;
                } else {
                    return folder;
                }
            });
        } else {
            return Promise.resolve(folder);
        }
    }

    private _downloadFiles(task: BackgroundTask, folder: string, files: List<File>): Array<Observable<any>> {
        const progressStep = 90 / files.size;
        return files.map((file) => {
            const fileLoader = this.storageService.getBlobContent(Promise.resolve(this.containerId), file.name);
            return fileLoader.download(path.join(folder, file.name)).do(() => {
                task.progress.next(task.progress.value + progressStep);
            });
        }).toArray();
    }

    private _getListOfFilesToDownload(): Observable<List<File>> {
        const patterns = this._getPatterns();
        // TODO get rid of this promise.
        const data = this.storageService.listBlobs(Promise.resolve(this.containerId));
        return data.fetchAll().flatMap(() => data.items.take(1)).map((items) => {
            data.dispose();
            const files = items.filter((file) => {
                for (let pattern of patterns) {
                    if (minimatch(file.name, pattern)) {
                        return true;
                    }
                }
                return false;
            });
            return List(files);
        });
    }

    private get _defaultDownloadFolder() {
        return path.join(this.fs.commonFolders.downloads, "batch-labs");
    }
}
