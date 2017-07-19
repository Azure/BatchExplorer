import { Model, Prop, Record } from "app/core";

export interface GroupSourceAttributes {
    fileGroup: string;
    prefix: string;
}

export interface FileGroupAttributes {
    source: GroupSourceAttributes;
    filePath: string;
}

/**
 * Specifies a file group source for a file group resource.
 */
@Model()
export class FileGroupSource extends Record<GroupSourceAttributes> {
    @Prop()
    public fileGroup: string;

    @Prop()
    public prefix: string;
}

/**
 * Specifies a file group resource to be downloaded from Azure blob storage to a compute node for a task.
 */
@Model()
export class FileGroup extends Record<FileGroupAttributes> {
    @Prop()
    public source: FileGroupSource;

    @Prop()
    public filePath: string;
}
