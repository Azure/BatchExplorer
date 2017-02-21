import { Record } from "immutable";

import { Partial } from "app/utils";
import { FileProperties, FilePropertiesAttributes } from "./file-properties";

export interface FileAttributes {
    name: string;
    url: string;
    isDirectory: boolean;
    properties: Partial<FilePropertiesAttributes>;
}

// tslint:disable:variable-name object-literal-sort-keys
const FileRecord = Record({
    name: null,
    url: null,
    isDirectory: false,
    properties: null,
});

/**
 * Class for displaying Batch File information.
 */
export class File extends FileRecord implements FileAttributes {
    public name: string;
    public url: string;
    public isDirectory: boolean;
    public properties: FileProperties;

    constructor(data: Partial<FileAttributes> = {}) {
        super(Object.assign({}, data, {
            properties: data.properties && new FileProperties(data.properties),
        }));
    }
}
