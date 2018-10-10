import { ChangeDetectorRef, Input } from "@angular/core";
import { FileLoader } from "../../file-loader";

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
export abstract class FileViewer {
    /**
     * Max file size this viewer support
     */
    public static readonly MAX_FILE_SIZE: number;

    public readonly commands?: FileViewerCommand[];

    @Input() public set fileLoader(fileLoader: FileLoader) {
        this._fileLoader = fileLoader;
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

    private _fileLoader: FileLoader;
    private _config: FileViewerConfig;

    constructor(protected changeDetector: ChangeDetectorRef) { }

    public abstract onFileLoaderChanges();
    public onConfigChanges?(newConfig: FileViewerConfig, oldConfig: FileViewerConfig);
}
