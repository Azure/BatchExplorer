export enum PinnedEntityType {
    Application,
    Job,
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
