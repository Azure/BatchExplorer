/**
 * Specifies a file to be downloaded from Azure blob storage to a compute node for a task.
 */
export class ResourceFile {
    public blobSource: string;
    public filePath: string;
    public fileMode: string;
}
