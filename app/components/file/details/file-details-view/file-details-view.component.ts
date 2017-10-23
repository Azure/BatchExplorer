import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { autobind } from "core-decorators";
import { remote } from "electron";
import { Observable } from "rxjs";

import "./file-details-view.scss";

import { NotificationService } from "app/components/base/notifications";
import { File, ServerError } from "app/models";
import { ElectronShell } from "app/services";
import { FileLoader } from "app/services/file";
import { Constants, DateUtils, log, prettyBytes } from "app/utils";

@Component({
    selector: "bl-file-details-view",
    templateUrl: "file-details-view.html",
})
export class FileDetailsViewComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;
    @Input() public tailable: boolean = false;
    @Output() public back = new EventEmitter();

    public filename: string;
    public file: File;
    public fileNotFound = false;
    public contentSize: string = "-";
    public lastModified: string = "-";
    public downloadEnabled: boolean;

    constructor(
        private shell: ElectronShell,
        private notificationService: NotificationService) {
        this.downloadEnabled = true;
    }

    public ngOnChanges(inputs) {
        if (inputs.fileLoader) {
            this.filename = this.fileLoader && this.fileLoader.displayName;
            this._updateFileProperties();
        }
    }

    @autobind()
    public refresh() {
        return this._updateFileProperties(true);
    }

    @autobind()
    public downloadFile() {
        const dialog = remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Download",
            defaultPath: this.filename,
        });

        if (localPath) {
            return this._saveFile(localPath);
        }
    }

    @autobind()
    public openDefaultEditor() {
        return this.fileLoader.cache().cascade((pathToFile) => {
            this.shell.openItem(pathToFile);
        });
    }

    public goBack() {
        this.back.emit();
    }

    private _saveFile(pathToFile) {
        if (pathToFile === undefined) {
            return;
        }
        const obs = this.fileLoader.download(pathToFile);

        obs.subscribe({
            next: () => {
                this.shell.showItemInFolder(pathToFile);
                this.notificationService.success("Download complete!", `File was saved locally at ${pathToFile}`);
            },
            error: (error: ServerError) => {
                this.notificationService.error(
                    "Download failed",
                    `${this.filename} failed to download. ${error.message}`,
                );
            },
        });
        return obs;
    }

    private _updateFileProperties(forceNew = false): Observable<any> {
        this.contentSize = "-";
        this.lastModified = "-";
        this.fileNotFound = false;
        const obs = this.fileLoader.getProperties(forceNew);
        obs.subscribe({
            next: (file: File) => {
                this.file = file;
                this.contentSize = prettyBytes(file.properties.contentLength);
                this.lastModified = DateUtils.prettyDate(file.properties.lastModified);
            },
            error: (error: ServerError) => {
                if (error.status === Constants.HttpCode.NotFound) {
                    this.fileNotFound = true;
                } else {
                    log.error(`Error loading file ${this.filename}`, error);
                }
            },
        });

        return obs;
    }
}
