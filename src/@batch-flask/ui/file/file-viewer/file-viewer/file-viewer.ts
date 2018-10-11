import { ChangeDetectorRef, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { FileLoader } from "../../file-loader";
import { File } from "../../file.model";

export interface FileViewerCommand {
    label: string;
    icon: string;
    color: string;
}

export interface FileViewerConfig {
    tailable?: boolean;
}

/**
 * Generic file viewer
 */
export abstract class FileViewer implements OnDestroy {
    /**
     * Max file size this viewer support
     */
    public static readonly MAX_FILE_SIZE: number;

    public readonly commands?: FileViewerCommand[];

    @Input() public set fileLoader(fileLoader: FileLoader) {
        this._fileLoader = fileLoader;
        this._listenForFileChanges();
        this.onFileLoaderChanges();
        this.changeDetector.markForCheck();
    }
    public get fileLoader() { return this._fileLoader; }

    @Input() public set config(config: FileViewerConfig) {
        const old = this._config;
        this._config = config;
        if (this.onConfigChanges) {
            this.onConfigChanges(config, old);
        }
        this.changeDetector.markForCheck();
    }
    public get config() { return this._config; }

    public file: File;

    private _fileLoader: FileLoader;
    private _config: FileViewerConfig;
    private _fileChangeSub: Subscription;

    constructor(protected changeDetector: ChangeDetectorRef) { }

    public abstract onFileLoaderChanges();
    public onConfigChanges?(currentConfig: FileViewerConfig, oldConfig: FileViewerConfig);
    public onFileChanges?(currentFile: File, oldFile: File);

    public ngOnDestroy() {
        this._clearFileChangesSub();
    }

    private _listenForFileChanges() {
        this._clearFileChangesSub();
        if (!this.fileLoader) { return; }
        this._fileChangeSub = this.fileLoader.fileChanged.subscribe((file) => {
            if (this.onFileChanges) {
                const oldFile = this.file;
                this.file = file;
                this.onFileChanges(file, oldFile);
            }
        });
    }

    private _clearFileChangesSub() {
        if (this._fileChangeSub) {
            this._fileChangeSub.unsubscribe();
        }
    }
}
