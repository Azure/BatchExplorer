import { FileGroupCreateDto } from "app/models/dtos";

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
    let data: any = {
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
        name: fileGroup.name,
        folder: fileGroup.folder,
        includeSubDirectories: fileGroup.includeSubDirectories,
        accessPolicy: fileGroup.accessPolicy,
        options: fileGroup.options,
    };
}
