import { FileGroupCreateDto } from "app/models/dtos";
import { Constants } from "common";

export interface FileOrDirectoryModel {
    path: string;
}

export interface FileGroupOptionsModel {
    prefix?: string;
    flatten: boolean;
    fullPath: boolean;
}

export interface CreateFileGroupModel {
    name: string;
    paths: FileOrDirectoryModel[];
    includeSubDirectories: boolean;
    accessPolicy: string;
    options: FileGroupOptionsModel;
}

export function createFileGroupFormToJsonData(formData: CreateFileGroupModel): any {
    const data: any = {
        name: formData.name,
        paths: formData.paths,
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
        paths: fileGroup.paths,
        includeSubDirectories: fileGroup.includeSubDirectories,
        accessPolicy: fileGroup.accessPolicy,
        options: fileGroup.options,
    };
}
