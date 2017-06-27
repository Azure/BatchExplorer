import * as path from "path";
import { Observable } from "rxjs";

import { File } from "app/models";
import { log } from "app/utils";
import { FileSystemService } from "../fs.service";

export type PropertiesFunc = () => Observable<File>;
export type ContentFunc = (options: FileLoadOptions) => Observable<FileLoadResult>;

export interface FileLoaderConfig {
    filename: string;
    source: FileSource;
    groupId?: string;
    fs: FileSystemService;
    properties: PropertiesFunc;
    content: ContentFunc;
}

export interface FileLoadOptions {
    rangeStart?: number;
    rangeEnd?: number;
}

export interface FileLoadResult {
    content: string;
}

export type FileSource = "task" | "node" | "blob";
export const FileSource = {
    task: "task" as FileSource,
    node: "node" as FileSource,
    blob: "blob" as FileSource,
};

export class FileLoader {
    public readonly filename: string;
    public readonly source: FileSource;

    /**
     * Optional name of subfolder to prevent collision with caches
     */
    public readonly groupId: string;

    private _fs: FileSystemService;
    private _properties: PropertiesFunc;
    private _content: ContentFunc;
    private _cachedProperties: File;

    constructor(config: FileLoaderConfig) {
        this.filename = config.filename;
        this._properties = config.properties;
        this._content = config.content;
        this.groupId = config.groupId || "";
        this.source = config.source;
        this._fs = config.fs;
    }

    public properties(forceNew = false): Observable<File> {
        if (!forceNew && this._cachedProperties) {
            return Observable.of(this._cachedProperties);
        }
        const obs = this._properties();
        obs.subscribe({
            next: (file) => {
                this._cachedProperties = file;
            },
            error: (error) => {
                log.error("Error getting the file properties!", error);
            },
        });
        return obs;
    }

    public content(options: FileLoadOptions = {}): Observable<FileLoadResult> {
        return this._content(options);
    }

    public download(dest: string): Observable<string> {
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
        return this.properties().cascade((file: File) => {
            const filename = this._hashFilename(file);
            const destination = path.join(this._fs.commonFolders.temp, this.source, this.groupId, filename);
            console.log("Destination will be", destination);
            return Observable.fromPromise(this._fs.exists(destination)).flatMap((exists) => {
                if (exists) {
                    return Observable.of(destination);
                } else {
                    return this.download(destination);
                }
            }).share();
        });
    }

    private _hashFilename(file: File) {
        const hash = file.properties.lastModified.getTime().toString(36);
        const segements = file.name.split(/[\\\/]/);
        const filename = segements.pop();
        segements.push(`${hash}.${filename}`);
        return path.join(...segements);
    }
}
