import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { List } from "immutable";
import * as path from "path";
import { Observable, forkJoin, from } from "rxjs";

import { autobind } from "@batch-flask/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity-monitor";
import { SecureUtils } from "@batch-flask/utils";
import { FileSystemService } from "app/services";
import { FileNavigator } from "app/services/file";
import * as minimatch from "minimatch";
import { map, reduce } from "rxjs/operators";
import "./download-folder-dialog.scss";
@Component({
    selector: "bl-download-folder-dialog",
    templateUrl: "download-folder-dialog.html",
})
export class DownloadFolderComponent {
    /**
     * Navigator used to list the files. This make sure this component is generic and can be used with any file sources
     */
    public set navigator(navigator: FileNavigator) {
        this._navigator = navigator;
        this.downloadFolder.setValue(this._defaultDownloadFolder);
    }
    public get navigator() { return this._navigator; }

    public patterns = new FormControl("**/*");
    public downloadFolder = new FormControl("");
    public subfolder: string = "";
    /**
     * Folder to download. Leave blank to download all files under navigator
     */
    public folder: string = "";

    private _navigator: FileNavigator;

    constructor(
        public dialogRef: MatDialogRef<DownloadFolderComponent>,
        private fs: FileSystemService,
        private activityService: ActivityService,
    ) { }

    public get title() {
        if (this.folder) {
            return `Download: ${this.folder}`;
        } else {
            return "Download all files";
        }
    }

    @autobind()
    public startDownload() {
        this._startDownloadAsync();
        return Observable.of({});
    }

    public updateDownloadFolder(folder: string) {
        this.downloadFolder.setValue(folder);
    }

    private _startDownloadAsync(): void {
        const activity = new Activity("Downloading Files", true, () => {
            return forkJoin(from(this._getDownloadFolder()), this._getListOfFilesToDownload()).pipe(
                map(result => {
                    const [folder, files] = result;
                    return files.map(file => {
                        return new Activity("Downloading One File", false, () => {
                            return this._downloadFile(folder, file);
                        });
                    });
                }),
                reduce((folder, activities) => {
                    return activities;
                }),
            );
        });

        this.activityService.loadAndRun(activity);

        // const folder = await this._getDownloadFolder();

        // this.backgroundTaskService.startTask(this.title, (task: BackgroundTask) => {
        //     const subject = new AsyncSubject();
        //     task.progress.next(1);
        //     this._getListOfFilesToDownload().subscribe((files) => {
        //         if (files.size === 0) {
        //             this.notificationService.warn(
        //                 "Pattern not found",
        //                 `Failed to find pattern: ${this._getPatterns()}`,
        //             );
        //             task.progress.next(100);
        //             subject.complete();
        //         } else {
        //             task.progress.next(10);
        //             const downloadObs = this._downloadFiles(task, folder, files);
        //             Observable.forkJoin(downloadObs).subscribe(() => {
        //                 this.shell.showItemInFolder(folder);
        //                 task.progress.next(100);
        //                 subject.complete();
        //             });
        //         }
        //     });

        //     return subject.asObservable();
        // });
    }

    private _getPatterns(): string[] {
        return this.patterns.value.split("\n");
    }

    private async _getDownloadFolder(): Promise<string> {
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

    private _downloadFile(folder: string, file: File): Observable<any> {
        const fileLoader = this.navigator.getFile(file.name);
        const fileName = this._getSubdirectoryPath(file.name);
        const filePath = path.join(folder, fileName);
        return fileLoader.download(filePath);
    }

    // private _downloadFiles(task: BackgroundTask, folder: string, files: List<File>): Array<Observable<any>> {
    //     const progressStep = 90 / files.size;
    //     return files.map((file) => {
    //         const fileLoader = this.navigator.getFile(file.name);
    //         const fileName = this._getSubdirectoryPath(file.name);
    //         const filePath = path.join(folder, fileName);
    //         return fileLoader.download(filePath).do(() => {
    //             task.progress.next(task.progress.value + progressStep);
    //         });
    //     }).toArray();
    // }

    private _getListOfFilesToDownload(): Observable<List<File>> {
        const patterns = this._getPatterns();
        return this.navigator.listAllFiles(this.folder).map((items) => {
            const files = items.filter((file) => {
                for (const pattern of patterns) {
                    // Path prefix must be excluded when compared to pattern
                    const fileName = this._getSubdirectoryPath(file.name);
                    if (minimatch(fileName, pattern)) {
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

    private _getSubdirectoryPath(filePath: string) {
        return filePath.slice(this.folder.length);
    }
}
