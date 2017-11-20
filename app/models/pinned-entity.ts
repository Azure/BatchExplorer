import { Model, Prop, Record } from "app/core";

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

@Model()
export class PinnedEntity extends Record<PinnableEntity> {
    @Prop() public id: string;
    @Prop() public name: string;
    @Prop() public routerLink: string[];
    @Prop() public pinnableType: PinnedEntityType;
    @Prop() public url: string;
}
