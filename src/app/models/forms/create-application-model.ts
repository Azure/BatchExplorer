import { BatchApplication } from "app/models";

export interface CreateApplicationModel {
    id: string;
    version: string;
}

export function applicationToCreateFormModel(application: BatchApplication, version?: string): CreateApplicationModel {
    return {
        id: application.id,
        version: version,
    };
}
