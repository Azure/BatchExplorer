import { Application } from "app/models";

export interface CreateApplicationModel {
    id: string;
    displayName: string;
    defaultVersion: string;
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

export function applicationToFormModel(application: Application, version?: string): CreateApplicationModel {
    return {
        id: application.id,
        displayName: application.displayName,
        defaultVersion: application.defaultVersion,
        allowUpdates: application.allowUpdates,
        version: version,
    };
}
