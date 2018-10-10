import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Input,
    OnChanges,
    OnDestroy,
    ViewChild,
    ViewContainerRef,
} from "@angular/core";
import { HttpCode, ServerError, autobind } from "@batch-flask/core";
import { ElectronRemote, ElectronShell } from "@batch-flask/ui/electron";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { NotificationService } from "@batch-flask/ui/notifications";
import { DateUtils, prettyBytes } from "@batch-flask/utils";
import { Observable, Subscription } from "rxjs";
import { FileTypeAssociationService, FileViewerType } from "../file-type-association";

import { FileViewer } from "../file-viewer";
import "./file-viewer-container.scss";

@Component({
    selector: "bl-file-viewer-container",
    templateUrl: "file-viewer-container.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewerContainerComponent implements OnChanges, OnDestroy {
    @Input() public fileLoader: FileLoader;
    @Input() public tailable: boolean = false;

    public filename: string;
    public file: File;

    public unknownFileType = false;
    public fileNotFound = false;
    public forbidden = false;
    public contentSize: string = "-";
    public lastModified: string = "-";
    public downloadEnabled: boolean;
    public fileTooLarge: boolean;
    public componentType: FileViewerType;
    public viewRef: ComponentRef<FileViewer>;

    private _propertiesSub: Subscription;
    private _fileType: string;

    @ViewChild("viewerContainer", { read: ViewContainerRef }) private _viewerContainer: ViewContainerRef;

    constructor(
        private shell: ElectronShell,
        private remote: ElectronRemote,
        private resolver: ComponentFactoryResolver,
        private fileAssociationService: FileTypeAssociationService,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService) {
        this.downloadEnabled = true;
    }

    public ngOnChanges(inputs) {
        if (inputs.fileLoader) {
            this.filename = this.fileLoader && this.fileLoader.displayName;
            this._findFileType();
            this._updateFileProperties();
            this._clearPropertiesSub();
            this._propertiesSub = this.fileLoader.properties.subscribe((file) => {
                this.file = file;
                this.contentSize = prettyBytes(file.properties.contentLength);
                this.lastModified = DateUtils.prettyDate(file.properties.lastModified);

                if (this.componentType.MAX_FILE_SIZE
                    && file.properties.contentLength > this.componentType.MAX_FILE_SIZE) {
                    this.fileTooLarge = true;
                    this._clearViewer();
                } else {
                    this.fileTooLarge = false;
                    this._computeViewer();
                }
                this.changeDetector.markForCheck();
            });
        }
    }

    public ngOnDestroy() {
        this._clearPropertiesSub();
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

    public openAs(type: string) {
        this._fileType = type;
        this._findComponentType();
        this.changeDetector.markForCheck();
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
                    `${this.filename} failed to download. ${error.message}`,
                );
            },
        });
        return obs;
    }

    private _updateFileProperties(forceNew = false): Observable<any> {
        this.fileNotFound = false;
        this.forbidden = false;
        const obs = this.fileLoader.getProperties(forceNew);
        obs.subscribe({
            error: (error: ServerError) => {
                if (error.status === HttpCode.NotFound) {
                    this.fileNotFound = true;
                }
                if (error.status === HttpCode.Forbidden) {
                    this.forbidden = true;
                }
                this.changeDetector.markForCheck();
            },
        });

        return obs;
    }

    private _findFileType() {
        const filename = this.fileLoader.filename;
        if (!filename) {
            throw new Error(`Expect filename to be a valid string but was "${filename}"`);
        }

        this._fileType = this.fileAssociationService.getType(this.fileLoader.filename);
        this._findComponentType();
    }

    private _findComponentType() {
        let componentType = null;
        if (this._fileType) {
            componentType = this.fileAssociationService.getComponentType(this._fileType);
        }
        this.componentType = componentType;
        this.unknownFileType = !componentType;
        this.changeDetector.markForCheck();
    }

    private _clearViewer() {
        this._viewerContainer.clear();
        this.viewRef = null;
    }

    private _computeViewer() {
        if (this.viewRef && this.viewRef.componentType === this.componentType) {
            return; // Don't recreate if the component is already there
        }
        const componentFactory = this.resolver.resolveComponentFactory<FileViewer>(this.componentType);
        this._clearViewer();
        const ref = this.viewRef = this._viewerContainer.createComponent(componentFactory);
        ref.instance.fileLoader = this.fileLoader;
    }
}
