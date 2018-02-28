import { Model, Prop, Record } from "app/core";

export interface SubscriptionAttributes {
    id: string;
    subscriptionId: string;
    tenantId: string;
    displayName: string;
    state: string;
}

console.log("Sub", Record);
/**
 * Class for displaying MPI sub task information.
 */
@Model()
export class Subscription extends Record<SubscriptionAttributes> {
    @Prop() public id: string;
    @Prop() public subscriptionId: string;
    @Prop() public tenantId: string;
    @Prop() public displayName: string;
    @Prop() public state: string;
}
