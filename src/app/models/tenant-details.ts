import { Model, Prop, Record } from "@batch-flask/core";

export interface TenantDetailsAttributes {
    objectId: string;
    displayName: string;
}

/**
 * Class for tenant details
 */
@Model()
export class TenantDetails extends Record<TenantDetailsAttributes> {
    @Prop() public objectId: string;
    @Prop() public displayName: string;

    public get id() {
        return this.objectId;
    }
}
