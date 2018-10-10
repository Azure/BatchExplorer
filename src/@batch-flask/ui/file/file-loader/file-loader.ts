import { FileSystemService } from "@batch-flask/ui/electron";
import { CloudPathUtils, exists, log } from "@batch-flask/utils";
import * as path from "path";
import { BehaviorSubject, Observable, Subject, from, of } from "rxjs";
import {
    concatMap, distinctUntilChanged, flatMap, map, publishReplay, refCount, share, tap,
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
    public properties: Observable<File>;

    public readonly filename: string;
    public readonly source: string;
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
    private _properties = new BehaviorSubject<File>(null);
    private _propertiesGetter: PropertiesFunc;
    private _content: ContentFunc;
    private _download: DownloadFunc;
    private _fileChanged = new Subject<File>();
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

        this.fileChanged = this._fileChanged.asObservable();

        this.properties = of(null).pipe(
            flatMap(() => this.getProperties()),
            flatMap(() => this._properties),
            distinctUntilChanged((a, b) => a === b || a.equals(b)),
            publishReplay(1),
            refCount(),
        );
    }

    /**
     * Returns the properties once. This doesn't need any cleanup(i.e. no need to call dispose)
     * @param forceNew If set to false it will use the last value loaded
     */
    public getProperties(forceNew = false): Observable<File> {
        if (!forceNew && this._properties.value) {
            return of(this._properties.value);
        }

        const obs = this._propertiesGetter().pipe(
            tap((file) => this._updateProperties(file)),
            share(),
        );
        obs.subscribe({
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

    private _updateProperties(file: File) {
        const last = this._properties.value;
        this._properties.next(file);
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
