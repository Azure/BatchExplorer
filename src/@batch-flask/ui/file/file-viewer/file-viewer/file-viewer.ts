import { ChangeDetectorRef, Input } from "@angular/core";

import { FileLoader } from "../../file-loader";

/**
 * Generic file viewer
 */
export abstract class FileViewer {
    /**
     * Max file size this viewer support
     */
    public static readonly MAX_FILE_SIZE: number;

    @Input() public set fileLoader(fileLoader: FileLoader) {
        this._fileLoader = fileLoader;
        this.onFileLoaderChanges();
        this.changeDetector.markForCheck();
    }
    public get fileLoader() { return this._fileLoader; }

    private _fileLoader: FileLoader;

    constructor(protected changeDetector: ChangeDetectorRef) { }

    public abstract onFileLoaderChanges();
}
