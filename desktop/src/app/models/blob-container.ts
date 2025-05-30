import { Model, NavigableRecord, Prop, Record } from "@batch-flask/core";
import { StorageContainerProperties } from "app/services/storage";
import { Constants } from "common";
import { ContainerLease, ContainerLeaseAttributes } from "./container-lease";

export interface BlobContainerAttributes {
    id: string;
    name: string;
    publicAccessLevel: string;
    metadata?: any;
    lastModified?: Date;
    lease?: Partial<ContainerLeaseAttributes>;
}

/**
 * Class for displaying blob container information.
 */
@Model("BlobContainer")
export class BlobContainer extends Record<BlobContainerAttributes> implements NavigableRecord {
    // container name
    @Prop() public id: string;

    // container name with the prefix removed
    @Prop() public name: string;

    @Prop() public publicAccessLevel: string;
    @Prop() public metadata: any;
    @Prop() public lastModified?: Date;
    @Prop() public lease: ContainerLease;
    @Prop() public storageAccountId: string;

    constructor(container: StorageContainerProperties) {
        super(container);
        this.lease = new ContainerLease({
            state: container.leaseState,
            status: container.leaseStatus,
            duration: container.leaseDuration
        });
        this.publicAccessLevel = container.publicAccess;
    }

    public get routerLink(): string[] {
        if (this.isFileGroup) {
            return ["/data/file-groups/containers", this.id];
        } else {
            return ["/data", this.storageAccountId, "containers", this.id];

        }
    }

    public get isFileGroup() {
        return this.id && this.id.startsWith(Constants.legacyFileGroupPrefix);
    }

    public get uid() {
        return this.storageAccountId.toLowerCase() + "/" + this.id;
    }
}
