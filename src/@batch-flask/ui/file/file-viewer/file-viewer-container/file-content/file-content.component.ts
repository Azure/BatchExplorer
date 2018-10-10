import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ComponentFactoryResolver, ComponentRef,
    Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ViewContainerRef,
} from "@angular/core";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { File } from "@batch-flask/ui/file/file.model";
import { log } from "@batch-flask/utils";
import { Subscription } from "rxjs";
import { FileViewerType } from "../../file-type-association";
import { FileViewer } from "../../file-viewer/file-viewer";

import "./file-content.scss";

enum FileType {
    log = "log",
    image = "image",
    code = "code",
}

@Component({
    selector: "bl-file-content",
    templateUrl: "file-content.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileContentComponent implements OnChanges, OnDestroy {

    @Input() public fileLoader: FileLoader;
    @Input() public componentType: FileViewerType;
    @Input() public tailable: boolean = false;

    public file: File;
    public fileTooLarge: boolean = false;

    public FileType = FileType;

    @ViewChild("viewerContainer", { read: ViewContainerRef }) private _container: ViewContainerRef;

    private _propertySub: Subscription;
    private _viewerRef: ComponentRef<FileViewer>;

    constructor(
        private resolver: ComponentFactoryResolver,
        private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.fileLoader) {
            if (!this.fileLoader) {
                log.error("FileContentComponent fileLoader input is required but is", this.fileLoader);
            }

            this._clearPropertySub();

            this._propertySub = this.fileLoader.properties.subscribe((file) => {
                this.file = file;
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
        this._clearPropertySub();

    }

    private _clearPropertySub() {
        if (this._propertySub) {
            this._propertySub.unsubscribe();
        }
    }

    private _clearViewer() {
        this._container.clear();
        this._viewerRef = null;
    }

    private _computeViewer() {
        if (this._viewerRef && this._viewerRef.componentType === this.componentType) {
            return; // Don't recreate if the component is already there
        }
        const componentFactory = this.resolver.resolveComponentFactory<FileViewer>(this.componentType);
        this._clearViewer();
        const ref = this._viewerRef = this._container.createComponent(componentFactory);
        ref.instance.fileLoader = this.fileLoader;
    }
}
