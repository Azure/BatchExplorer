import { BatchApplication } from "../azure-batch/batch-application/batch-application";

export interface EditApplicationModel {
    name: string;
    defaultVersion: string;
    allowUpdates: boolean;
}

export function editApplicationFormToJsonData(formData: EditApplicationModel): any {
    const data: any = {
        name: formData.name,
        properties: {
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
    };
}
