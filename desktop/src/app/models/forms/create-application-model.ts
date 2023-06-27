import { BatchApplication } from "../azure-batch/batch-application/batch-application";

export interface CreateApplicationModel {
    name: string;
    version: string;
}

export function applicationToCreateFormModel(application: BatchApplication, version?: string): CreateApplicationModel {
    return {
        name: application.name,
        version: version,
    };
}
