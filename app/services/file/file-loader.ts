import * as path from "path";
import { Observable, Subject } from "rxjs";

import { File } from "app/models";
import { RxEntityProxy, getOnceProxy } from "app/services/core";
import { CloudPathUtils, exists, log } from "app/utils";
import { FileSystemService } from "../fs.service";

export type PropertiesFunc = () => RxEntityProxy<any, File>;
export type ContentFunc = (options: FileLoadOptions) => Observable<FileLoadResult>;
export type DownloadFunc = (destination: string) => Observable<boolean>;

export interface FileLoaderConfig {
    filename: string;
    source: FileSource;
    groupId?: string;
    fs: FileSystemService;
    properties: PropertiesFunc;
    content: ContentFunc;
    /**
     * Optional specify another function for downloading the file.
     * If not provided it will read the content and write it to file.
     */
    download?: DownloadFunc;

    /**
     * Optional list of error codes to not log in the console.
     */
    logIgnoreError?: number[];
}

export interface FileLoadOptions {
    rangeStart?: number;
    rangeEnd?: number;
}

export interface FileLoadResult {
    content: string;
}

export enum FileSource {
    task = "task",
    node = "node",
    blob = "blob",
}

export class FileLoader {
    public readonly filename: string;
    public readonly source: FileSource;
    /**
     * Optional name of subfolder to prevent collision with caches
     */
    public readonly groupId: string;

    /**
     * Event that notify when the file is different
     */
    public readonly fileChanged: Observable<File>;

    /**
     * Base path to show the file as relative to this.
     */
    public basePath: string;

    private _fs: FileSystemService;
    private _properties: PropertiesFunc;
    private _content: ContentFunc;
    private _download: DownloadFunc;
    private _cachedProperties: File;
    private _proxy: RxEntityProxy<any, File>;
    private _fileChanged = new Subject<File>();
    private _logIgnoreError: number[];

    constructor(config: FileLoaderConfig) {
        this.filename = config.filename;
        this._properties = config.properties;
        this._content = config.content;
        this.groupId = config.groupId || "";
        this.source = config.source;
        this._fs = config.fs;
        this._download = config.download;
        this._logIgnoreError = exists(config.logIgnoreError) ? config.logIgnoreError : [];

        this.fileChanged = this._fileChanged.asObservable();
    }

    /**
     * This will return a rx entity proxy.
     * This means you need to dispose the file loader when done using it.
     * If listen is never called you don't need to call dispose.
     */
    public listen(): RxEntityProxy<any, File> {
        if (!this._proxy) {
            this._proxy = this._properties();
            this._proxy.item.subscribe((file) => {
                this._updateProperties(file);
            });
            this._proxy.fetch();
        }
        return this._proxy;
    }

    /**
     * Returns the properties once. This doesn't need any cleanup(i.e. no need to call dispose)
     * @param forceNew If set to false it will use the last value loaded
     */
    public getProperties(forceNew = false): Observable<File> {
        if (!forceNew && this._cachedProperties) {
            return Observable.of(this._cachedProperties);
        }

        const obs = getOnceProxy(this._properties());
        obs.subscribe({
            next: (file) => {
                this._updateProperties(file);
            },
            error: (error) => {
                if (error && error.status && !this._logIgnoreError.includes(error.status)) {
                    log.error("Error getting the file properties!", Object.assign({}, error));
                }
            },
        });

        return obs;
    }

    public content(options: FileLoadOptions = {}): Observable<FileLoadResult> {
        return this._content(options);
    }

    public download(dest: string): Observable<string> {
        if (this._download) {
            const checkDirObs = Observable.fromPromise(this._fs.ensureDir(path.dirname(dest)));
            return checkDirObs.flatMap(() => this._download(dest)).map(x => dest).share();
        }
        const obs = this.content().concatMap((result) => {
            return this._fs.saveFile(dest, result.content);
        }).share();
        obs.subscribe();
        return obs;
    }

    /**
     * This will download the file at a prefix location in the temp folder
     * @returns observable that resolve the path of the cached file when done caching
     */
    public cache(): Observable<string> {
        return this.getProperties().cascade((file: File) => {
            const destination = this._getCacheDestination(file);
            return Observable.fromPromise(this._fs.exists(destination)).flatMap((exists) => {
                if (exists) {
                    return Observable.of(destination);
                } else {
                    return this.download(destination);
                }
            }).share();
        });
    }

    public get displayName() {
        if (this.basePath) {
            return CloudPathUtils.normalize(path.relative(this.basePath, this.filename));
        } else {
            return this.filename;
        }
    }
    /**
     * Dipose of the file loader entities if applicable
     * You MUST call this if you used .listen on a file loader otherwise there will be memory leaks.
     */
    public dispose() {
        if (this._proxy) {
            this._proxy.dispose();
            this._proxy = null;
        }
    }

    private _hashFilename(file: File) {
        const hash = file.properties.lastModified.getTime().toString(36);
        const segements = file.name.split(/[\\\/]/);
        const filename = segements.pop();
        segements.push(`${hash}.${filename}`);
        return path.join(...segements);
    }

    private _updateProperties(file: File) {
        const last = this._cachedProperties;
        this._cachedProperties = file;
        if (last && !last.equals(file)) {
            this._fileChanged.next(file);
        }
    }

    /**
     * Return a local path unique for this file at this version to allow caching.
     * @param file File properties returned by the server
     */
    private _getCacheDestination(file: File) {
        const filename = this._hashFilename(file);
        return path.join(this._fs.commonFolders.temp, this.source, this.groupId, filename);
    }

}
