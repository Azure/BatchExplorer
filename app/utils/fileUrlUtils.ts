import { FileType } from "app/models";
import { Constants } from "app/utils";

export function parseRelativePath(fileUrl: string): FileType {
    const parts: string[] = fileUrl.split(Constants.FileUrlStrings.Separator);
    let file: FileType = <any>{};
    if (parts) {
        if (parts[3] === Constants.FileUrlStrings.Job) {
            file.type = Constants.FileSourceTypes.Job;
        } else if (parts[3] === Constants.FileUrlStrings.Pool) {
            file.type = Constants.FileSourceTypes.Pool;
        }
        file.containerName = parts[4];
        file.entityName = parts[6];
        file.file = parts.slice(8, parts.length).join(Constants.FileUrlStrings.Separator);
    }

    return file;
}

export function getFileName(fileUrl: string): string {
    const parts: string[] = fileUrl.split(Constants.FileUrlStrings.Separator);
    return parts[parts.length - 1];
}

export function getFileExtension(fileUrl: string): string {
    return fileUrl.split(".").pop();
}
