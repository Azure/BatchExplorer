import { Model, Prop, Record } from "@batch-flask/core";
import { Partial } from "app/utils";
import { FileProperties, FilePropertiesAttributes } from "./file-properties";

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
