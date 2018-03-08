import { Model, Prop, Record } from "@batch-flask/core";

export interface SubscriptionAttributes {
    id: string;
    subscriptionId: string;
    tenantId: string;
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
    @Prop() public displayName: string;
    @Prop() public state: string;
}
