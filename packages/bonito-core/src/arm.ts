import { getEnvironment } from "./environment";

/**
 * Get the base url (ie: https://management.azure.com) of
 * Azure Resource Manager in the current cloud environment.
 *
 * @returns The ARM base url
 */
export function getArmUrl() {
    return getEnvironment().config.armUrl;
}

export interface ArmResourceListResponse<T> {
    value: T[];
    nextLink?: string;
}

const ARM_GUID_REGEX = /^[\w-]+$/;
const SUB_PREFIX = "/subscriptions/";
const TENANT_PREFIX = "/tenants/";

/**
 * Validate that a subscription resource ID is in the form
 * /subscriptions/00000000-0000-0000-0000-000000000000
 *
 * @param subArmId The ARM resource ID of the subscription
 * @returns True if valid, false otherwise
 */
export function isValidSubscriptionResourceId(subArmId: string): boolean {
    return (
        typeof subArmId === "string" &&
        subArmId.startsWith(SUB_PREFIX) &&
        isValidSubscriptionId(subArmId.slice(SUB_PREFIX.length))
    );
}

/**
 * Validate that a subscription ID is in the form 00000000-0000-0000-0000-000000000000
 *
 * @param subArmId The ID of the subscription
 * @returns True if valid, false otherwise
 */
export function isValidSubscriptionId(subId: string): boolean {
    return typeof subId === "string" && ARM_GUID_REGEX.test(subId);
}

/**
 * Normalize a subscription ID to its ARM resource ID format.
 * Throws an error if the given subscription ID is invalid.
 *
 * @param subscriptionId Either a short or long subscription ID
 * @returns A normalized subscription ID of the form
 *          /subscriptions/00000000-0000-0000-0000-000000000000
 */
export function normalizeSubscriptionResourceId(
    subscriptionId: string
): string {
    let normalized: string = subscriptionId;
    if (!subscriptionId.startsWith(SUB_PREFIX)) {
        normalized = `${SUB_PREFIX}${subscriptionId}`;
    }
    if (!isValidSubscriptionResourceId(normalized)) {
        throw new Error(`Invalid subscription ID: "${subscriptionId}"`);
    }
    return normalized;
}

/**
 * Normalize a subscription ID to its short ID format.
 * Throws an error if the given subscription ID is invalid.
 *
 * @param subscriptionId Either a short or long subscription ID
 * @returns A normalized subscription ID of the form 00000000-0000-0000-0000-000000000000
 */
export function normalizeSubscriptionId(subscriptionId: string): string {
    let normalized: string = subscriptionId;
    if (subscriptionId.startsWith(SUB_PREFIX)) {
        normalized = normalized.slice(SUB_PREFIX.length);
    }
    if (!isValidSubscriptionId(normalized)) {
        throw new Error(`Invalid subscription ID: "${subscriptionId}"`);
    }
    return normalized;
}

/**
 * Validate that a tenant resource ID is in the form
 * /tenants/00000000-0000-0000-0000-000000000000
 *
 * @param tenantArmId The ARM resource ID of the tenant
 * @returns True if valid, false otherwise
 */
export function isValidTenantResourceId(tenantArmId: string): boolean {
    return (
        typeof tenantArmId === "string" &&
        tenantArmId.startsWith(TENANT_PREFIX) &&
        isValidTenantId(tenantArmId.slice(TENANT_PREFIX.length))
    );
}

/**
 * Validate that a tenant ID is in the form 00000000-0000-0000-0000-000000000000
 *
 * @param tenantArmId The ID of the tenant
 * @returns True if valid, false otherwise
 */
export function isValidTenantId(tenantId: string): boolean {
    return typeof tenantId === "string" && ARM_GUID_REGEX.test(tenantId);
}

/**
 * Normalize a tenant ID to its ARM resource ID format.
 * Throws an error if the given tenant ID is invalid.
 *
 * @param tenantId Either a short or long tenant ID
 * @returns A normalized tenant ID of the form
 *          /tenants/00000000-0000-0000-0000-000000000000
 */
export function normalizeTenantResourceId(tenantId: string): string {
    let normalized: string = tenantId;
    if (!tenantId.startsWith(TENANT_PREFIX)) {
        normalized = `${TENANT_PREFIX}${tenantId}`;
    }
    if (!isValidTenantResourceId(normalized)) {
        throw new Error(`Invalid tenant ID: "${tenantId}"`);
    }
    return normalized;
}

/**
 * Normalize a tenant ID to its short ID format.
 * Throws an error if the given tenant ID is invalid.
 *
 * @param tenantId Either a short or long tenant ID
 * @returns A normalized tenant ID of the form 00000000-0000-0000-0000-000000000000
 */
export function normalizeTenantId(tenantId: string): string {
    let normalized: string = tenantId;
    if (tenantId.startsWith(TENANT_PREFIX)) {
        normalized = normalized.slice(TENANT_PREFIX.length);
    }
    if (!isValidTenantId(normalized)) {
        throw new Error(`Invalid tenant ID: "${tenantId}"`);
    }
    return normalized;
}
