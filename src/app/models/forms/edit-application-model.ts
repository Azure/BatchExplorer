import { BatchApplication } from "../azure-batch/batch-application/batch-application";

export interface EditApplicationModel {
    name: string;
    defaultVersion: string;
    allowUpdates: boolean;
    displayName: string;
}

export function editApplicationFormToJsonData(formData: EditApplicationModel): any {
    const data: any = {
        properties: {
            displayName: formData.displayName,
            defaultVersion: formData.defaultVersion,
            allowUpdates: formData.allowUpdates,
        },
    };

    return data;
}

export function applicationToEditFormModel(application: BatchApplication): EditApplicationModel {
    return {
        name: application.name,
        defaultVersion: application.properties.defaultVersion,
        allowUpdates: application.properties.allowUpdates,
        displayName: application.properties.displayName,
    };
}
