import { Observable } from "rxjs";

import { File } from "app/models";
import { FileSystemService } from "../fs.service";

export type PropertiesFunc = () => Observable<File>;
export type ContentFunc = (options: FileLoadOptions) => Observable<FileLoadResult>;

export interface FileLoaderConfig {
    filename: string;
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

export class FileLoader {
    public filename: string;
    private _fs: FileSystemService;
    private _properties: PropertiesFunc;
    private _content: ContentFunc;

    constructor(config: FileLoaderConfig) {
        this.filename = config.filename;
        this._properties = config.properties;
        this._content = config.content;
        this._fs = config.fs;
    }

    public properties(): Observable<File> {
        return this._properties();
    }

    public content(options: FileLoadOptions = {}): Observable<FileLoadResult> {
        return this._content(options);
    }

    public download(dest: string) {
        return this.content().flatMap((result) => {
            return this._fs.saveFile(dest, result.content);
        });
    }
}
