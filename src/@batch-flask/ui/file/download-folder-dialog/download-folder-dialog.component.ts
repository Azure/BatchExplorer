import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { autobind } from "@batch-flask/core";
import { Activity, ActivityService } from "@batch-flask/ui/activity";
import { ElectronShell, FileSystemService } from "@batch-flask/ui/electron";
import { FileNavigator } from "@batch-flask/ui/file/file-navigator";
import { SecureUtils } from "@batch-flask/utils";
import { List } from "immutable";
import * as minimatch from "minimatch";
import * as path from "path";
import { Observable, forkJoin, from, of } from "rxjs";
import { flatMap, map, reduce } from "rxjs/operators";

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
        private shell: ElectronShell,
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
        return of({});
    }

    public updateDownloadFolder(folder: string) {
        this.downloadFolder.setValue(folder);
    }

    /**
     * Start a new asynchronous storage folder download
     * Gets the list of files to download from information in the component
     * Creates a file download activity which creates a single file download subactivity for each file
     */
    private _startDownloadAsync(): void {
        // prepare the initializer function
        const initializer = () => {
            // get the download folder and a list of files to download
            return forkJoin(from(this._getDownloadFolder()), this._getListOfFilesToDownload()).pipe(
                // map the list of files to a list of file download activities
                map(result => {
                    const [folder, files] = result;
                    return files.map(file => {
                        // each file becomes a new activity whose initializer is to download one file
                        return new Activity("Downloading One File", () => {
                            return this._downloadFile(folder, file);
                        });
                    }).toArray();
                }),
                // reduce the output to contain only activities and not the
                reduce((folder, activities) => {
                    return activities;
                }),
            );
        };

        const activity = new Activity("Downloading Files", initializer);
        activity.done.pipe(
            flatMap(obs => {
                return from(this._getDownloadFolder());
            }),
        ).subscribe(folder => {
            this.shell.showItemInFolder(folder);
        });

        // load and run a new file download activity with the declared function
        this.activityService.exec(activity);
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

    private _getListOfFilesToDownload(): Observable<List<File>> {
        const patterns = this._getPatterns();
        return this.navigator.listAllFiles(this.folder).pipe(map((items) => {
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
        }),
        );
    }

    private get _defaultDownloadFolder() {
        return path.join(this.fs.commonFolders.downloads, "batch-explorer");
    }

    private _getSubdirectoryPath(filePath: string) {
        return filePath.slice(this.folder.length);
    }
}
