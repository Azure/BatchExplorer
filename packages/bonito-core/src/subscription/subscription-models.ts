export interface Subscription {
    /**
     * ARM resource ID of the subscription
     */
    id: string;

    /**
     * Short subscription ID
     */
    subscriptionId: string;

    /**
     * The tenant ID for this subscription (not the full ARM resource ID)
     */
    tenantId: string;

    /**
     * Friendly name for this subscription
     */
    displayName: string;

    /**
     * Subscription state
     */
    state: "Deleted" | "Disabled" | "Enabled" | "PastDue" | "Warned";

    /**
     * Authorization type for the subscription. Values are 'Legacy', 'RoleBased', 'Legacy, RoleBased'.
     */
    authorizationSource: string;

    /**
     * Subscription policies
     */
    subscriptionPolicies: SubscriptionPolicies;

    /**
     * ARM tags for the subscription
     */
    tags?: Record<string, string>;
}

export interface SubscriptionPolicies {
    /**
     * The subscription location placement id.
     */
    locationPlacementId: string;

    /**
     * The subscription quota id.
     */
    quotaId: string;

    /**
     * The subscription spending limit Values "On", "Off", "CurrentPeriodOff"
     */
    spendingLimit?: string;
}
