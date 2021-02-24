import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges } from "@angular/core";
import { ServerError, autobind } from "@batch-flask/core";
import { ElectronRemote, ElectronShell } from "@batch-flask/electron";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { NotificationService } from "@batch-flask/ui/notifications";
import { prettyBytes } from "@batch-flask/utils";
import { SaveDialogReturnValue } from "electron";
import { Observable, Subscription } from "rxjs";
import { FileViewer, FileViewerCommand, FileViewerConfig } from "../../file-viewer";

import "./file-viewer-header.scss";

@Component({
    selector: "bl-file-viewer-header",
    templateUrl: "file-viewer-header.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewerHeaderComponent implements OnChanges {

    public get canSave(): boolean {
        return Boolean(this.fileLoader && this.fileViewer && !this.fileLoader.isReadonly && this.fileViewer.save);
    }
    @Input() public fileLoader: FileLoader;
    @Input() public config: FileViewerConfig;
    @Input() public fileViewer: FileViewer | null;

    public filename: string;
    public contentSize: string = "-";
    public lastModified: Date;
    public file: File;
    public actionDisabled: boolean;
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
            this._propertiesSub = this.fileLoader.properties.subscribe({
                next: (file) => {
                    if (file instanceof File) {
                        this.file = file;
                        this.contentSize = prettyBytes(file.properties.contentLength);
                        this.lastModified = file.properties.lastModified;
                    } else {
                        this.actionDisabled = true;
                    }
                    this.changeDetector.markForCheck();
                },
                error: () => null,
            });
        }
    }

    @autobind()
    public refresh() {
        return this.fileLoader.refreshProperties();
    }

    @autobind()
    public async downloadFile(): Promise<Observable<string>> {
        const dialog = this.remote.dialog;
        const retValue: SaveDialogReturnValue = await dialog.showSaveDialog({
            buttonLabel: "Download",
            defaultPath: this.fileLoader.filename,
        });

        const localPath: string = retValue.filePath;

        if (localPath) {
            return this._saveFile(localPath);
        }
    }

    @autobind()
    public openDefaultEditor() {
        return this.fileLoader.getLocalVersionPath().subscribe((pathToFile) => {
            this.shell.openItem(pathToFile);
        });
    }

    @autobind()
    public save() {
        if (this.fileViewer.save) {
            return this.fileViewer.save();
        }
    }

    public trackCommand(index: number, _: FileViewerCommand) {
        return index;
    }

    private _clearPropertiesSub() {
        if (this._propertiesSub) {
            this._propertiesSub.unsubscribe();
        }
    }

    private _saveFile(pathToFile: string): Observable<string> {
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
