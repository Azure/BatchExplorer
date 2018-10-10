import { Type } from "@angular/core";
import { CodeFileViewerComponent } from "../code-file-viewer";
import { ImageFileViewerComponent } from "../image-file-viewer";
import { LogFileViewerComponent } from "../log-file-viewer";
import { FileViewer } from "./file-viewer";

export type FileViewerType = typeof FileViewer & Type<FileViewer>;

/**
 * Class managing what file type are opened with which component
 */
export class FileViewerResolver {

    constructor(private readonly _map: StringMap<Type<FileViewer>> = {}) {

    }

    public get(type: string): FileViewerType | null {
        return this._map[type] as any;
    }

    public has(type: string): boolean {
        return type in this._map;
    }

    public clone(overrides: StringMap<Type<FileViewer>>) {
        return new FileViewerResolver({
            ...this._map,
            ...overrides,
        });
    }
}

export const DEFAULT_FILE_VIEWER_RESOLVER = new FileViewerResolver({
    log: LogFileViewerComponent,
    code: CodeFileViewerComponent,
    image: ImageFileViewerComponent,
});
