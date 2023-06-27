import { Model, Prop, Record } from "@batch-flask/core";

export interface FilePropertiesAttributes {
    contentLength: number;
    contentType: string;
    creationTime: Date | string;
    lastModified: Date | string;
}

/**
 * Class for displaying Batch File information.
 */
@Model()
export class FileProperties extends Record<FilePropertiesAttributes> {
    @Prop() public contentLength: number;
    @Prop() public contentType: string;
    @Prop(Date) public creationTime: Date;
    @Prop(Date) public lastModified: Date;
}
