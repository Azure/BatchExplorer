import { ChangeDetectorRef, Input, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { FileLoader } from "../../file-loader";
import { File } from "../../file.model";
import { FileAssociation } from "../file-type-association";

export interface FileViewerCommand {
    label: string;
    icon: string;
    color: string;
    execute: () => any;
}

export interface FileViewerConfig {
    tailable?: boolean;

    /**
     * If files can be downloaded(Default: true)
     */
    downloadEnabled?: boolean;

    fileAssociations?: FileAssociation[];
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
        if (this._fileLoader === fileLoader) { return; }
        this._fileLoader = fileLoader;
        this.onFileLoaderChanges();
        this._listenForFileChanges();
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
    public modified: Observable<boolean>;

    protected _modified = new BehaviorSubject(false);

    private _fileLoader: FileLoader;
    private _config: FileViewerConfig;
    private _fileChangeSub: Subscription;

    constructor(protected changeDetector: ChangeDetectorRef) {
        this.modified = this._modified.asObservable();
    }

    public abstract onFileLoaderChanges();
    public onConfigChanges?(currentConfig: FileViewerConfig, oldConfig: FileViewerConfig);
    public onFileChanges?(currentFile: File, oldFile: File);
    public save?(): Observable<any>;

    public ngOnDestroy() {
        this._clearFileChangesSub();
    }

    private _listenForFileChanges() {
        this._clearFileChangesSub();
        if (!this.fileLoader) { return; }
        this._fileChangeSub = this.fileLoader.properties.subscribe((file) => {
            if (!(file instanceof File)) { return; }
            const oldFile = this.file;
            this.file = file;
            if (this.onFileChanges) {
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
