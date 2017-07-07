
export interface FormGroupOptionsModel {
    prefix?: string;
    flatten: string;
    fullPath: string;
}

export interface CreateFormGroupModel {
    name: string;
    folder: string;
    accessPolicy: string;
    options: FormGroupOptionsModel;
}

export function createFormGroupFormToJsonData(formData: CreateFormGroupModel): any {
    let data: any = {
        name: formData.name,
        folder: formData.folder,
        accessPolicy: formData.accessPolicy,
        options: formData.options,
    };

    return data;
}
