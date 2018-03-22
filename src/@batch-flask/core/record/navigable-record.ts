export enum PinnedEntityType {
    Application,
    Job,
    JobSchedule,
    Pool,
    FileGroup,
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
