import { Record } from "immutable";

import { FileProperties } from "./fileProperties";

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
export class File extends FileRecord {
    public name: string;
    public url: string;
    public isDirectory: boolean;
    public properties: FileProperties;
}
