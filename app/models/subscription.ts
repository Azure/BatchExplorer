import { Record } from "immutable";

const SubscriptionRecord = Record({
    id: null,
    subscriptionId: null,
    tenantId: null,
    displayName: null,
    state: null,
});

/**
 * Class for displaying MPI sub task information.
 */
export class Subscription extends SubscriptionRecord {
    public id: string;
    public subscriptionId: string;
    public tenantId: string;
    public displayName: string;
    public state: string;
}
