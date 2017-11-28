import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { List } from "immutable";
import * as path from "path";
import { AsyncSubject, Observable } from "rxjs";

import { BackgroundTask, BackgroundTaskService } from "app/components/base/background-task";
import { ElectronShell, FileSystemService, StorageService } from "app/services";
import { CloudPathUtils, SecureUtils } from "app/utils";
import { autobind } from "core-decorators";
import * as minimatch from "minimatch";
import "./file-tree-download.scss";

@Component({
    selector: "bl-file-tree-download",
    templateUrl: "file-tree-download.html",
})
export class FileTreeDownloadComponent {
    public set containerId(containerId: string) {
        this._containerId = containerId;
        this.downloadFolder.setValue(this._defaultDownloadFolder);
    }
    public get containerId() { return this._containerId; }

    public patterns = new FormControl("**/*");
    public downloadFolder = new FormControl("");
    public subfolder: string = "";
    public pathPrefix: string = "";

    private _containerId: string;

    constructor(
        public dialogRef: MatDialogRef<FileTreeDownloadComponent>,
        private storageService: StorageService,
        private backgroundTaskService: BackgroundTaskService,
        private fs: FileSystemService,
        private shell: ElectronShell,
    ) {
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

        this.backgroundTaskService.startTask("Download directory", (task: BackgroundTask) => {
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
        // Gets current selected folder by joining base download folder and selected directory name
        // Ensures that this selected directory is unique under base download folder
        const folder = path.join(this.downloadFolder.value, this.subfolder);
        return this.fs.exists(folder).then((exists) => {
            if (exists) {
                return `${folder}_${SecureUtils.uuid()}`;
            } else {
                return folder;
            }
        });
    }

    private _downloadFiles(task: BackgroundTask, folder: string, files: List<File>): Array<Observable<any>> {
        const progressStep = 90 / files.size;
        return files.map((file) => {
            const fileLoader = this.storageService.getBlobContent(this.containerId, file.name);
            const fileName = CloudPathUtils.leafDir(CloudPathUtils.normalize(file.name));
            const filePath = path.join(folder, fileName);
            return fileLoader.download(filePath).do(() => {
                task.progress.next(task.progress.value + progressStep);
            });
        }).toArray();
    }

    private _getListOfFilesToDownload(): Observable<List<File>> {
        const patterns = this._getPatterns();
        const data = this.storageService.blobListView(this.containerId, { recursive: true });
        return data.fetchAll().flatMap(() => data.items.take(1)).map((items) => {
            data.dispose();
            const files = items.filter((file) => {
                if (!file.name.startsWith(this.pathPrefix)) {
                    return false;
                }
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
        return path.join(this.fs.commonFolders.downloads, "batch-labs", this._containerId);
    }
}
