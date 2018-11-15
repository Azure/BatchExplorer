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

    /**
     * Unique identifier across all batch accounts
     */
    uid: string;

    name?: string;
    routerLink: string[];
    pinnableType: PinnedEntityType;
}

export interface NavigableRecord {
    id: string;

    /**
     * Unique identifier across all batch accounts
     */
    uid: string;

    name?: string;
    routerLink: string[];
}
