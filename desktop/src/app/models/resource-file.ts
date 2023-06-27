import { Model, Prop, Record } from "@batch-flask/core";

export interface ResourceFileAttributes {
    autoStorageContainerName?: string;
    blobPrefix?: string;
    httpUrl?: string;
    storageContainerUrl?: string;
    filePath: string;
    fileMode?: string;
}

/**
 * Specifies a file to be downloaded from Azure blob storage to a compute node for a task.
 */
@Model()
export class ResourceFile extends Record<ResourceFileAttributes> {
    @Prop() public autoStorageContainerName: string;

    @Prop() public blobPrefix: string;

    @Prop() public httpUrl: string;

    @Prop() public storageContainerUrl: string;

    @Prop() public filePath: string;

    @Prop() public fileMode: string;

    public get id() {
        return this.filePath;
    }
}
