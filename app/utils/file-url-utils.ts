import { FileType } from "app/models";
import { Constants } from "app/utils";

export class FileUrlUtils {
    public static parseRelativePath(fileUrl: string): FileType {
        const parts: string[] = fileUrl.split(Constants.FileUrlStrings.Separator);
        const file: FileType = {} as any;
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

    public static getFileName(fileUrl: string): string {
        const parts: string[] = fileUrl.split(Constants.FileUrlStrings.Separator);
        return parts[parts.length - 1];
    }

    public static getFileExtension(fileUrl: string): string {
        return fileUrl.split(".").pop();
    }
}
