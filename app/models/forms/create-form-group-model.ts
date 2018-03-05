import { FileGroupCreateDto } from "app/models/dtos";
import { Constants } from "app/utils";

export interface FileGroupOptionsModel {
    prefix?: string;
    flatten: boolean;
    fullPath: boolean;
}

export interface CreateFileGroupModel {
    name: string;
    folder: string;
    includeSubDirectories: boolean;
    accessPolicy: string;
    options: FileGroupOptionsModel;
}

export function createFileGroupFormToJsonData(formData: CreateFileGroupModel): any {
    const data: any = {
        name: formData.name,
        folder: formData.folder,
        includeSubDirectories: formData.includeSubDirectories,
        accessPolicy: formData.accessPolicy,
        options: formData.options,
    };

    return data;
}

export function fileGroupToFormModel(fileGroup: FileGroupCreateDto): CreateFileGroupModel {
    return {
        // we don't want the prefix on the group name when editing.
        name: fileGroup.name.startsWith(Constants.ncjFileGroupPrefix)
            ? fileGroup.name.substr(Constants.ncjFileGroupPrefix.length, fileGroup.name.length)
            : fileGroup.name,
        folder: fileGroup.folder,
        includeSubDirectories: fileGroup.includeSubDirectories,
        accessPolicy: fileGroup.accessPolicy,
        options: fileGroup.options,
    };
}
