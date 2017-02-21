/**
 * The FileType class is used to identify if the file is coming from a task or a node
 */
export interface FileType {
    containerName: string;
    entityName: string;
    file: string;
    type: string;
}
