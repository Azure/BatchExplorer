import { Record } from "immutable";

import { Partial } from "app/utils";

export interface FilePropertiesAttributes {
    contentLength: number;
    contentType: string;
    creationTime: Date;
    lastModified: Date;
}

// tslint:disable:variable-name object-literal-sort-keys
const FilePropertiesRecord = Record({
    contentLength: null,
    contentType: null,
    creationTime: null,
    lastModified: null,
});

/**
 * Class for displaying Batch File information.
 */
export class FileProperties extends FilePropertiesRecord implements FilePropertiesAttributes {
    public contentLength: number;
    public contentType: string;
    public creationTime: Date;
    public lastModified: Date;

    constructor(data: Partial<FilePropertiesAttributes> = {}) {
        super(data);
    }
}
