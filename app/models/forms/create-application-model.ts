import { Application } from "app/models";

export interface CreateApplicationModel {
    id: string;
    version: string;
}

export function applicationToCreateFormModel(application: Application, version?: string): CreateApplicationModel {
    return {
        id: application.id,
        version: version,
    };
}
