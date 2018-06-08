import { Model, Prop, Record } from "@batch-flask/core";
import { TenantDetails, TenantDetailsAttributes } from "./tenant-details";

export interface SubscriptionAttributes {
    id: string;
    subscriptionId: string;
    tenantId: string;
    tenant: TenantDetailsAttributes;
    displayName: string;
    state: string;
}

/**
 * Class for subscription information
 */
@Model()
export class Subscription extends Record<SubscriptionAttributes> {
    @Prop() public id: string;
    @Prop() public subscriptionId: string;
    @Prop() public tenantId: string;
    @Prop() public tenant: TenantDetails;
    @Prop() public displayName: string;
    @Prop() public state: string;
}
