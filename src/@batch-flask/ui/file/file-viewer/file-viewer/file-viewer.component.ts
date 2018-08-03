import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from "@angular/core";
import { HttpCode, ServerError, autobind } from "@batch-flask/core";
import { ElectronRemote, ElectronShell } from "@batch-flask/ui/electron";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { NotificationService } from "@batch-flask/ui/notifications";
import { DateUtils, prettyBytes } from "@batch-flask/utils";
import { Observable } from "rxjs";

import "./file-viewer.scss";

@Component({
    selector: "bl-file-viewer",
    templateUrl: "file-viewer.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewerComponent implements OnChanges {
    @Input() public fileLoader: FileLoader;
    @Input() public tailable: boolean = false;
    @Output() public back = new EventEmitter();

    public filename: string;
    public file: File;
    public fileNotFound = false;
    public forbidden = false;
    public contentSize: string = "-";
    public lastModified: string = "-";
    public downloadEnabled: boolean;

    constructor(
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private changeDetector: ChangeDetectorRef,
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
        const dialog = this.remote.dialog;
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
        return this.fileLoader.cache().subscribe((pathToFile) => {
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
        this.forbidden = false;
        const obs = this.fileLoader.getProperties(forceNew);
        obs.subscribe({
            next: (file: File) => {
                this.file = file;
                this.contentSize = prettyBytes(file.properties.contentLength);
                this.lastModified = DateUtils.prettyDate(file.properties.lastModified);
                this.changeDetector.markForCheck();
            },
            error: (error: ServerError) => {
                if (error.status === HttpCode.NotFound) {
                    this.fileNotFound = true;
                }
                if(error.status === HttpCode.Forbidden) {
                    this.forbidden = true;
                }
                this.changeDetector.markForCheck();
            },
        });

        return obs;
    }
}
