import { Model, Prop, Record } from "app/core";

export interface ResourceFileAttributes {
    blobSource: string;
    filePath: string;
    fileMode: string;
}

/**
 * Specifies a file to be downloaded from Azure blob storage to a compute node for a task.
 */
@Model()
export class ResourceFile extends Record<ResourceFileAttributes> {
    @Prop()
    public blobSource: string;

    @Prop()
    public filePath: string;

    @Prop()
    public fileMode: string;
}
