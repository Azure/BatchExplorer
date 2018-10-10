import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, Input,
    OnChanges, SimpleChanges, ViewChild, ViewContainerRef,
} from "@angular/core";
import { BatchFlaskSettingsService } from "@batch-flask/ui/batch-flask-settings";
import { FileLoader } from "@batch-flask/ui/file/file-loader";
import { log } from "@batch-flask/utils";

import { FileViewer } from "../../file-viewer/file-viewer";
import { FILE_VIEWER_DEFINITIONS } from "../file-viewer-definitions";
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
export class FileContentComponent implements OnChanges {
    public unkownFile: boolean;

    public get fileTypes() {
        return this.settingsService.settings.fileTypes || {};
    }
    public FileType = FileType;

    @Input() public fileLoader: FileLoader;
    @Input() public tailable: boolean = false;

    public fileType: FileType;

    @ViewChild("viewerContainer", { read: ViewContainerRef }) private _container: ViewContainerRef;

    constructor(
        private settingsService: BatchFlaskSettingsService,
        private resolver: ComponentFactoryResolver,
        private changeDetector: ChangeDetectorRef) { }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.fileLoader) {
            if (!this.fileLoader) {
                log.error("FileContentComponent fileLoader input is required but is", this.fileLoader);
            }
            this._findFileType();
            this._computeComponent();
        }
    }

    public openAs(type: FileType) {
        this.fileType = type;
        this.changeDetector.markForCheck();
    }

    private _findFileType() {
        const filename = this.fileLoader.filename;
        if (!filename) {
            throw new Error(`Expect filename to be a valid string but was "${filename}"`);
        }

        const name = filename.toLowerCase();
        for (const type of Object.keys(this.fileTypes)) {
            const extensions = this.fileTypes[type];
            for (const ext of extensions) {
                if (name.endsWith(`.${ext}`)) {
                    this.fileType = type as any;
                    this.changeDetector.markForCheck();
                    return;
                }
            }
        }

        this.fileType = null;
        this.changeDetector.markForCheck();
    }

    private _computeComponent() {
        const component = FILE_VIEWER_DEFINITIONS[this.fileType];
        this.unkownFile = false;
        if (!component) {
            this.unkownFile = true;
            this._container.clear();
            return;
        }
        const componentFactory = this.resolver.resolveComponentFactory<FileViewer>(component);
        this._container.clear();
        const ref = this._container.createComponent(componentFactory);
        ref.instance.fileLoader = this.fileLoader;
    }
}
