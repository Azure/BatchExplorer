import { Application } from "app/models";

export interface EditApplicationModel {
    displayName: string;
    defaultVersion: string;
    allowUpdates: boolean;
}

export function editApplicationFormToJsonData(formData: EditApplicationModel): any {
    let data: any = {
        displayName: formData.displayName,
        defaultVersion: formData.defaultVersion,
        allowUpdates: formData.allowUpdates,
    };

    return data;
}

export function applicationToEditFormModel(application: Application): EditApplicationModel {
    return {
        displayName: application.displayName,
        defaultVersion: application.defaultVersion,
        allowUpdates: application.allowUpdates,
    };
}
