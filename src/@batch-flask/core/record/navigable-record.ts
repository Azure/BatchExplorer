export enum PinnedEntityType {
    Application = "Application",
    Job = "Job",
    JobSchedule = "JobSchedule",
    Pool = "Pool",
    Certificate = "Certificate",
    StorageContainer = "StorageContainer",
}

export interface PinnableEntity {
    id: string;
    name?: string;
    routerLink: string[];
    pinnableType: PinnedEntityType;
    url: string;
}

export interface NavigableRecord {
    id: string;
    name?: string;
    routerLink: string[];
    url: string;
}
