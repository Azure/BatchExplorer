import { Model, Prop, Record } from "@batch-flask/core";
import { FileProperties, FilePropertiesAttributes } from "./file-properties.model";

export interface FileAttributes {
    name: string;
    url: string;
    isDirectory: boolean;
    properties: Partial<FilePropertiesAttributes>;
}

/**
 * Class for displaying Batch File information.
 */
@Model()
export class File extends Record<FileAttributes> {
    @Prop() public name: string;
    @Prop() public url: string;
    @Prop() public isDirectory: boolean = false;
    @Prop() public properties: FileProperties;
}
