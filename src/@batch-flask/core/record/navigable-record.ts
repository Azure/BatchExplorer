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
    pinnableType: PinnedEntityType | null;
}

export interface NavigableRecord {
    id: string;

    /**
     * Unique identifier across all batch accounts
     */
    uid: string;

    /**
     * Friendlier id.
     * For ARM resources this is the resource name without the full URL.
     * For batch resource it is the same as the id
     */
    name: string;
    routerLink: string[];
}
