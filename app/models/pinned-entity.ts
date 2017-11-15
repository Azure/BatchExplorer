import { Model, Prop, Record } from "app/core";

export enum PinnedEntityType {
    BatchApplication,
    Job,
    Node,
    Pool,
    Task,
}

export interface PinnableEntity {
    id: string;
    routerLink: string[];
    pinnableType: PinnedEntityType;
    url: string;
}

@Model()
export class PinnedEntity extends Record<PinnableEntity> {
    @Prop() public id: string;
    @Prop() public routerLink: string[];
    @Prop() public pinnableType: PinnedEntityType;
    @Prop() public url: string;
}
