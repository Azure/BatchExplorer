import { Application } from "app/models";

export interface CreateApplicationModel {
    id: string;
    displayName: string;
    allowUpdates: boolean;
    version: string;
}

export function createApplicationFormToJsonData(formData: CreateApplicationModel): any {
    let data: any = {
        id: formData.id,
        displayName: null,
        version: formData.version,
        allowUpdates: true,
    };

    return data;
}

export function applicationToFormModel(application: Application): CreateApplicationModel {
    return {
        id: application.id,
        displayName: application.defaultVersion,
        allowUpdates: application.allowUpdates,
        version: null,
    };
}
