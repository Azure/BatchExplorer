import { Record } from "immutable";

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
export class FileProperties extends FilePropertiesRecord {
    public contentLength: number;
    public contentType: string;
    public creationTime: Date;
    public lastModified: Date;
}
