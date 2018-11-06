import { BatchApplication } from "../batch-application";

export interface EditApplicationModel {
    displayName: string;
    defaultVersion: string;
    allowUpdates: boolean;
}

export function editApplicationFormToJsonData(formData: EditApplicationModel): any {
    const data: any = {
        displayName: formData.displayName,
        defaultVersion: formData.defaultVersion,
        allowUpdates: formData.allowUpdates,
    };

    return data;
}

export function applicationToEditFormModel(application: BatchApplication): EditApplicationModel {
    return {
        displayName: application.displayName,
        defaultVersion: application.defaultVersion,
        allowUpdates: application.allowUpdates,
    };
}
