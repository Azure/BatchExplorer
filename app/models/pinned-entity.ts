import { Model, Prop, Record } from "app/core";

export enum PinnedEntityType {
    Job,
    Node,
    Pool,
    Task,
}

export interface PinnedEntityAttributes {
    id: string;
    routerLink: string[];
    type: PinnedEntityType;
}

@Model()
export class PinnedEntity extends Record<PinnedEntityAttributes> {
    @Prop() public id: string;
    @Prop() public routerLink: string[];
    @Prop() public type: PinnedEntityType;

    // todo-andrew: routerLink.toString()
    // public get isBatchManaged() {
    //     return this.properties && this.properties.poolAllocationMode === PoolAllocationMode.BatchService;
    // }
}
