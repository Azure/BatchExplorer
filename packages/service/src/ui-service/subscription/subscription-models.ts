export interface Subscription {
    id: string;
    subscriptionId: string;
    tenantId: string;
    displayName: string;
    state: "Deleted" | "Disabled" | "Enabled" | "PastDue" | "Warned";
    tags?: Record<string, string>;
}
