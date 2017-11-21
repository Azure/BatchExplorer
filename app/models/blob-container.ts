import { Model, Prop, Record } from "app/core";
import { ContainerLease, ContainerLeaseAttributes } from "./container-lease";
import { PinnableEntity, PinnedEntityType } from "./pinned-entity";

export interface BlobContainerAttributes {
    id: string;
    name: string;
    publicAccessLevel: string;
    metadata?: any;
    lastModified: Date;
    lease?: Partial<ContainerLeaseAttributes>;
}

/**
 * Class for displaying blob container information.
 */
@Model()
export class BlobContainer extends Record<BlobContainerAttributes> implements PinnableEntity {
    // container name
    @Prop() public id: string;

    // container name with the prefix removed
    @Prop() public name: string;

    @Prop() public publicAccessLevel: string;
    @Prop() public metadata: any;
    @Prop() public lastModified: Date;
    @Prop() public lease: ContainerLease;
    @Prop() public url: string;

    public get routerLink(): string[] {
        return ["/data", this.id];
    }

    public get pinnableType(): PinnedEntityType {
        return PinnedEntityType.FileGroup;
    }
}
