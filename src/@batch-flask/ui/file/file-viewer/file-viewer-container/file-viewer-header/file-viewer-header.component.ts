import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { ServerError, autobind } from "@batch-flask/core";
import { ElectronShell } from "@batch-flask/electron";
import { ElectronRemote } from "@batch-flask/ui";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { NotificationService } from "@batch-flask/ui/notifications";
import { DateUtils, prettyBytes } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { FileViewer } from "../../file-viewer";

import "./file-viewer-header.scss";

@Component({
    selector: "bl-file-viewer-header",
    templateUrl: "file-viewer-header.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewerHeaderComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;
    @Input() public fileViewer: FileViewer | null;
    @Input() public refresh: () => any;

    public filename: string;
    public contentSize: string = "-";
    public lastModified: string = "-";
    public file: File;
    private _propertiesSub: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private remote: ElectronRemote,
        private notificationService: NotificationService,
        private shell: ElectronShell) {

    }

    public ngOnChanges(changes) {
        if (changes.fileLoader) {
            this.filename = this.fileLoader && this.fileLoader.displayName;

            this._clearPropertiesSub();
            this._propertiesSub = this.fileLoader.properties.subscribe((file) => {
                this.file = file;
                this.contentSize = prettyBytes(file.properties.contentLength);
                this.lastModified = DateUtils.prettyDate(file.properties.lastModified);
                this.changeDetector.markForCheck();
            });
        }
    }

    @autobind()
    public downloadFile() {
        const dialog = this.remote.dialog;
        const localPath = dialog.showSaveDialog({
            buttonLabel: "Download",
            defaultPath: this.fileLoader.filename,
        });

        if (localPath) {
            return this._saveFile(localPath);
        }
    }

    @autobind()
    public openDefaultEditor() {
        return this.fileLoader.cache().subscribe((pathToFile) => {
            this.shell.openItem(pathToFile);
        });
    }

    private _clearPropertiesSub() {
        if (this._propertiesSub) {
            this._propertiesSub.unsubscribe();
        }
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
                    `${this.fileLoader.filename} failed to download. ${error.message}`,
                );
            },
        });
        return obs;
    }
}
