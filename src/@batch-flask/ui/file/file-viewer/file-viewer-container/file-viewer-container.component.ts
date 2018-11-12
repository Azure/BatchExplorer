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
import { HttpCode, ServerError } from "@batch-flask/core";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { Subscription } from "rxjs";
import { FileTypeAssociationService, FileViewerType } from "../file-type-association";
import { FileViewer, FileViewerConfig } from "../file-viewer";

import "./file-viewer-container.scss";

const defaultConfig = Object.freeze({
    tailable: false,
    downloadEnabled: true,
});

@Component({
    selector: "bl-file-viewer-container",
    templateUrl: "file-viewer-container.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewerContainerComponent implements OnChanges, OnDestroy {
    @Input() public fileLoader: FileLoader;
    @Input() public set config(config: FileViewerConfig) {
        this._config = { ...defaultConfig, ...config };
    }
    public get config() { return this._config; }

    public file: File;
    public filename: string;

    public unknownFileType = false;
    public fileNotFound = false;
    public forbidden = false;
    public fileTooLarge: boolean;
    public componentType: FileViewerType | null;
    public viewRef: ComponentRef<FileViewer>;

    private _propertiesSub: Subscription;
    private _config = defaultConfig;
    private _fileType: string;

    @ViewChild("viewerContainer", { read: ViewContainerRef }) private _viewerContainer: ViewContainerRef;

    constructor(
        private resolver: ComponentFactoryResolver,
        private fileAssociationService: FileTypeAssociationService,
        private changeDetector: ChangeDetectorRef) {
    }

    public ngOnChanges(inputs) {
        if (inputs.fileLoader) {
            this.filename = this.fileLoader && this.fileLoader.displayName;

            this._findFileType();
            this._clearPropertiesSub();
            this._propertiesSub = this.fileLoader.properties.subscribe({
                next: (file: File | ServerError) => {
                    if (file instanceof File) {
                        this.fileNotFound = false;
                        this.forbidden = false;

                        this.file = file;

                        if (this.componentType
                            && this.componentType.MAX_FILE_SIZE
                            && file.properties.contentLength > this.componentType.MAX_FILE_SIZE) {
                            this.fileTooLarge = true;
                            this._clearViewer();
                        } else {
                            this.fileTooLarge = false;
                            this._computeViewer();
                        }
                        this.changeDetector.markForCheck();
                    } else {
                        this._handleError(file);
                    }
                },
            });
        }
    }

    public ngOnDestroy() {
        this._clearPropertiesSub();
    }

    public openAs(type: string) {
        this._fileType = type;
        this._findComponentType();
        this._computeViewer();
        this.changeDetector.markForCheck();
    }

    private _clearPropertiesSub() {
        if (this._propertiesSub) {
            this._propertiesSub.unsubscribe();
        }
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
        console.log("CMP", componentType);
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
        this._clearViewer();
        if (!this.componentType) { return; }
        const componentFactory = this.resolver.resolveComponentFactory<FileViewer>(this.componentType);
        const ref = this.viewRef = this._viewerContainer.createComponent(componentFactory);
        ref.instance.fileLoader = this.fileLoader;
        ref.instance.config = this.config;
    }

    private _handleError(error: ServerError) {
        this._clearViewer();
        if (error.status === HttpCode.NotFound) {
            this.fileNotFound = true;
        }
        if (error.status === HttpCode.Forbidden) {
            this.forbidden = true;
        }
        this.changeDetector.markForCheck();
    }
}
