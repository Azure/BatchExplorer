import { Model, Prop, Record } from "@batch-flask/core";

export interface FilePropertiesAttributes {
    contentLength: number;
    contentType: string;
    creationTime: Date;
    lastModified: Date;
}

/**
 * Class for displaying Batch File information.
 */
@Model()
export class FileProperties extends Record<FilePropertiesAttributes> {
    @Prop() public contentLength: number;
    @Prop() public contentType: string;
    @Prop() public creationTime: Date;
    @Prop() public lastModified: Date;
}
