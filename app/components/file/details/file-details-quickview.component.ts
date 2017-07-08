import { Component, Input, OnChanges, OnDestroy } from "@angular/core";
import { autobind } from "core-decorators";
import { remote } from "electron";

import { NotificationService } from "app/components/base/notifications";
import { File, ServerError } from "app/models";
import { ElectronShell, FileService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { FileLoader } from "app/services/file";
import { FileUrlUtils, prettyBytes } from "app/utils";

export interface IfileDetails {
    jobId: string;
    taskId: string;
    nodeId: string;
    poolId: string;
    sourceType: string;
}

@Component({
    selector: "bl-file-details-quickview",
    templateUrl: "file-details.html",
})
export class FileDetailsQuickviewComponent implements OnChanges, OnDestroy {
    public static breadcrumb({ filename }) {
        return { name: filename, label: "File", invertName: true };
    }

    @Input()
    public options: IfileDetails;

    public jobId: string;
    public taskId: string;
    public nodeId: string;
    public poolId: string;
    public sourceType: string;
    public filename: string;
    public contentSize: string;
    public downloadEnabled: boolean;
    public url: string;
    public fileLoader: FileLoader = null;
    public fileData: RxEntityProxy<any, File>;

    constructor(
        private fileService: FileService,
        private shell: ElectronShell,
        private notificationService: NotificationService) {
        this.downloadEnabled = true;
    }

    public ngOnChanges(inputs) {
        if (inputs.options) {
            this.sourceType = this.options["type"];
            this.jobId = this.options["jobId"];
            this.taskId = this.options["taskId"];
            this.poolId = this.options["poolId"];
            this.nodeId = this.options["nodeId"];
            this.initFileLoader();
        }
    }

    public initFileLoader(){
        this._clearFileLoader();
        this._setupFileLoader();
    }

    public ngOnDestroy() {
        this._clearFileLoader();
    }

    @autobind()
    public refresh() {
        return this.fileData.refresh();
    }

    @autobind()
    public downloadFile() {
        const dialog = remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Download",
            // Set default filename of file to download
            defaultPath: FileUrlUtils.getFileName(this.url),
        });

        if (localPath) {
            return this._saveFile(localPath);
        }
    }

    @autobind()
    public openExternal() {
        return this.fileLoader.cache().cascade((pathToFile) => {
            this.shell.openExternal(pathToFile);
        });
    }

    public get isJobFile() {
        return this.jobId && this.taskId;
    }

    public get isPoolFile() {
        return this.poolId && this.nodeId;
    }

    private _setupFileLoader() {
        let obs: FileLoader;
        if (this.isJobFile) {
            obs = this.fileService.fileFromTask(this.jobId, this.taskId, this.filename);
        } else if (this.isPoolFile) {
            obs = this.fileService.fileFromNode(this.poolId, this.nodeId, this.filename);
        } else {
            throw new Error("Unrecognised source type: " + this.sourceType);
        }
        this.fileLoader = obs;
        this.fileData = this.fileLoader.listen();
        this.fileData.item.subscribe((file) => {
            if (!file) { return; }
            this.contentSize = prettyBytes(file.properties.contentLength);
            this.url = decodeURIComponent(file.url);
        });
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
                    `${this.filename} failed to download. ${error.body.message}`,
                );
            },
        });
        return obs;
    }

    private _clearFileLoader() {
        if (this.fileLoader) {
            this.fileLoader.dispose();
            this.fileLoader = null;
        }
    }
}
