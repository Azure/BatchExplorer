import { Observable } from "rxjs";

import { File } from "app/models";

export interface FileLoadOptions {
    rangeStart?: number;
    rangeEnd?: number;
}

export interface FileLoadResult {
    content: string;
}

export type PropertiesFunc = () => Observable<File>;
export type ContentFunc = (options: FileLoadOptions) => Observable<FileLoadResult>;

export class FileLoader {
    private _properties: PropertiesFunc;
    private _content: ContentFunc;

    constructor(config: { properties: PropertiesFunc, content: ContentFunc }) {
        this._properties = config.properties;
        this._content = config.content;
    }

    public properties(): Observable<File> {
        return this._properties();
    }

    public content(options: FileLoadOptions = {}): Observable<FileLoadResult> {
        return this._content(options);
    }
}
