import { ServerError } from "@batch-flask/core";
import { FileSystemService } from "@batch-flask/ui/electron";
import { CloudPathUtils, exists, log } from "@batch-flask/utils";
import * as path from "path";
import { BehaviorSubject, Observable, from, of } from "rxjs";
import {
    catchError, concatMap, distinctUntilChanged, flatMap, map, publishReplay, refCount, share, skip, take, tap,
} from "rxjs/operators";
import { File } from "../file.model";

export type PropertiesFunc = () => Observable<File>;
export type ContentFunc = (options: FileLoadOptions) => Observable<FileLoadResult>;
export type DownloadFunc = (destination: string) => Observable<boolean>;

export interface FileLoaderConfig {
    filename: string;
    source: string;
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

export class FileLoader {
    public properties: Observable<File | ServerError>;

    public readonly filename: string;
    public readonly source: string;
    /**
     * Optional name of subfolder to prevent collision with caches
     */
    public readonly groupId: string;

    /**
     * Base path to show the file as relative to this.
     */
    public basePath: string;

    private _fs: FileSystemService;
    private _properties = new BehaviorSubject<File | ServerError | null>(null);
    private _propertiesGetter: PropertiesFunc;
    private _content: ContentFunc;
    private _download: DownloadFunc;
    private _logIgnoreError: number[];

    constructor(config: FileLoaderConfig) {
        this.filename = config.filename;
        this._propertiesGetter = config.properties;
        this._content = config.content;
        this.groupId = config.groupId || "";
        this.source = config.source;
        this._fs = config.fs;
        this._download = config.download;
        this._logIgnoreError = exists(config.logIgnoreError) ? config.logIgnoreError : [];

        this.properties = of(null).pipe(
            flatMap(() => this.refreshProperties()),
            flatMap(() => this._properties),
            distinctUntilChanged((a, b) => {
                if (a === b) {
                    return true;
                } else if (a instanceof ServerError || b instanceof ServerError) {
                    return false;
                } else {
                    return a.equals(b);
                }
            }),
            publishReplay(1),
            refCount(),
        );
    }

    /**
     * Event that notify when the file is different
     */
    public get fileChanged() {
        return this.properties.pipe(skip(1));
    }

    public getProperties() {
        return this.properties.pipe(take(1));
    }

    public refreshProperties() {
        return this._propertiesGetter().pipe(
            catchError(error => {
                if (error && error.status && !this._logIgnoreError.includes(error.status)) {
                    log.error("Error getting the file properties!", Object.assign({}, error));
                }
                return of(error);
            }),
            tap(value => this._properties.next(value)),
        );
    }

    public content(options: FileLoadOptions = {}): Observable<FileLoadResult> {
        return this._content(options);
    }

    public download(dest: string): Observable<string> {
        if (this._download) {
            const checkDirObs = from(this._fs.ensureDir(path.dirname(dest)));
            return checkDirObs.pipe(
                flatMap(() => this._download(dest)),
                map(x => dest),
                share(),
            );
        }

        const obs = this.content().pipe(
            concatMap((result) => {
                return this._fs.saveFile(dest, result.content);
            }),
            share(),
        );
        obs.subscribe();

        return obs;
    }

    /**
     * This will download the file at a prefix location in the temp folder
     * @returns observable that resolve the path of the cached file when done caching
     */
    public cache(): Observable<string> {
        return this.getProperties().pipe(
            flatMap((file: File) => {
                const destination = this._getCacheDestination(file);
                return from(this._fs.exists(destination)).pipe(
                    flatMap((exists) => {
                        if (exists) {
                            return of(destination);
                        } else {
                            return this.download(destination);
                        }
                    }),
                );
            }),
            share(),
        );
    }

    public get displayName() {
        if (this.basePath) {
            return CloudPathUtils.normalize(path.relative(this.basePath, this.filename));
        } else {
            return this.filename;
        }
    }

    private _hashFilename(file: File) {
        const hash = file.properties.lastModified.getTime().toString(36);
        // clean any unwanted : characters from the file path
        const cleaned = file.name.replace(":", "");
        const segements = cleaned.split(/[\\\/]/);
        const filename = segements.pop();
        segements.push(`${hash}.${filename}`);

        return path.join(...segements);
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
