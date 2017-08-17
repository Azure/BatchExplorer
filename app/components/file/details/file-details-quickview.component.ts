import { Component, Input, OnChanges } from "@angular/core";
import { autobind } from "core-decorators";
import { remote } from "electron";

import { NotificationService } from "app/components/base/notifications";
import { File, ServerError } from "app/models";
import { ElectronShell } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { FileLoader } from "app/services/file";
import { FileUrlUtils } from "app/utils";

@Component({
    selector: "bl-file-details-quickview",
    templateUrl: "file-details.html",
})
export class FileDetailsQuickviewComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;

    public sourceType: string;
    public filename: string;
    public contentSize: string;
    public downloadEnabled: boolean;
    public url: string;
    public fileData: RxEntityProxy<any, File>;

    constructor(
        private shell: ElectronShell,
        private notificationService: NotificationService) {
        this.downloadEnabled = true;
    }

    public ngOnChanges(inputs) {
        if (inputs.fileLoader) {
            this.filename = this.fileLoader && this.fileLoader.filename;
        }
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
}
