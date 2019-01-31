import { BatchApplication } from "../azure-batch/batch-application/batch-application";

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
