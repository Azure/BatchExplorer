
export interface FileGroupOptionsModel {
    prefix?: string;
    flatten: string;
    fullPath: string;
}

export interface CreateFileGroupModel {
    name: string;
    folder: string;
    accessPolicy: string;
    options: FileGroupOptionsModel;
}

export function createFileGroupFormToJsonData(formData: CreateFileGroupModel): any {
    let data: any = {
        name: formData.name,
        folder: formData.folder,
        accessPolicy: formData.accessPolicy,
        options: formData.options,
    };

    return data;
}
