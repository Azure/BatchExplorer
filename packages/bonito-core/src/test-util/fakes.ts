import { normalizeSubscriptionResourceId, normalizeTenantId } from "../arm";
import { Location } from "../location";
import { ResourceGroup } from "../resource-group";
import { StorageAccount } from "../storage";
import { Subscription } from "../subscription";
import { Tenant } from "../tenant";
import { equalsIgnoreCase, startsWithIgnoreCase } from "../util";

/**
 * Represents an entire fake dataset which has been crafted to make sense
 * when taken as a whole (no bad references, etc).
 *
 * IMPORTANT: Keys should be lower-cased to support case-insensitive lookups.
 */
export interface FakeSet {
    defaultTenantArmId: string;

    /**
     * Get a tenant by case-insensitive ID
     *
     * @param tenantId Either the plain tenant ID or full ARM resource ID of
     *                 the tenant
     */
    getTenant(tenantId: string): Tenant | undefined;

    /**
     * Lists tenants in the fake set
     */
    listTenants(): Tenant[];

    /**
     * Get a subscription by case-insensitive ID
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    getSubscription(subscriptionId: string): Subscription | undefined;

    /**
     * List subscriptions by the global default tenant of the fake set
     */
    listSubscriptionsByDefaultTenant(): Subscription[];

    /**
     * Create or update a subscription
     *
     * @param subscription The subscription to create/update
     */
    putSubscription(subscription: Subscription): Subscription;

    /**
     * List subscriptions by tenant
     *
     * @param tenantId Either the plain tenant ID or full ARM resource ID of
     *                 the tenant
     */
    listSubscriptionsByTenant(tenantId: string): Subscription[];

    /**
     * Get a location by case-insensitive ID
     *
     * @param locationId The ARM resource ID of the location
     */
    getLocation(locationId: string): Location | undefined;

    /**
     * List locations by subscription
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    listLocationsBySubscription(subscriptionId: string): Location[];

    /**
     * Get a resource group by case-insensitive ID
     *
     * @param resourceGroupId The ARM resource ID of the resource group
     */
    getResourceGroup(resourceGroupId: string): ResourceGroup | undefined;

    /**
     * List resource groups by subscription
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    listResourceGroupsBySubscription(subscriptionId: string): ResourceGroup[];

    /**
     * Get a Storage account by case-insensitive ID
     *
     * @param storageAccountId The ARM resource ID of the Storage account
     */
    getStorageAccount(storageAccountId: string): StorageAccount | undefined;

    /**
     * List storage accounts by subscription
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    listStorageAccountsBySubscription(subId: string): StorageAccount[];
}

export abstract class AbstractFakeSet implements FakeSet {
    abstract defaultTenantArmId: string;

    protected abstract tenants: { [tenantArmId: string]: Tenant };
    protected abstract subscriptions: { [subArmId: string]: Subscription };
    protected abstract locations: { [locationArmId: string]: Location };
    protected abstract resourceGroups: { [rgId: string]: ResourceGroup };
    protected abstract storageAccounts: {
        [storageAccountId: string]: StorageAccount;
    };

    getTenant(tenantId: string): Tenant | undefined {
        return this.tenants[normalizeTenantId(tenantId).toLowerCase()];
    }

    listTenants(): Tenant[] {
        return Object.values(this.tenants);
    }

    getSubscription(subscriptionId: string): Subscription | undefined {
        return this.subscriptions[
            normalizeSubscriptionResourceId(subscriptionId).toLowerCase()
        ];
    }

    listSubscriptionsByDefaultTenant(): Subscription[] {
        return this.listSubscriptionsByTenant(this.defaultTenantArmId);
    }

    listSubscriptionsByTenant(tenantId: string): Subscription[] {
        if (!tenantId) {
            return [];
        }
        tenantId = normalizeTenantId(tenantId);
        return Object.values(this.subscriptions).filter((sub) =>
            equalsIgnoreCase(sub.tenantId, tenantId)
        );
    }

    putSubscription(subscription: Subscription): Subscription {
        if (!subscription.id) {
            throw new Error(
                "Cannot create/update a subscription without a valid ID"
            );
        }

        this.subscriptions[subscription.id] = subscription;
        return subscription;
    }

    getLocation(locationId: string): Location | undefined {
        return this.locations[locationId.toLowerCase()];
    }

    listLocationsBySubscription(subId: string): Location[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.locations).filter((location) =>
            startsWithIgnoreCase(location.id, subId)
        );
    }

    getResourceGroup(resourceGroupId: string): ResourceGroup | undefined {
        return this.resourceGroups[resourceGroupId.toLowerCase()];
    }

    listResourceGroupsBySubscription(subId: string): ResourceGroup[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.resourceGroups).filter((rg) =>
            startsWithIgnoreCase(rg.id, subId)
        );
    }

    getStorageAccount(storageAccountId: string): StorageAccount | undefined {
        return this.storageAccounts[storageAccountId.toLowerCase()];
    }

    listStorageAccountsBySubscription(subId: string): StorageAccount[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.storageAccounts).filter((storageAcct) =>
            startsWithIgnoreCase(storageAcct.id, subId)
        );
    }
}

export class BasicFakeSet extends AbstractFakeSet {
    defaultTenantArmId: string =
        "/tenants/99999999-9999-9999-9999-999999999999";

    protected tenants: { [tenantId: string]: Tenant } = {
        "/tenants/99999999-9999-9999-9999-999999999999": {
            id: "/tenants/99999999-9999-9999-9999-999999999999",
            tenantId: "99999999-9999-9999-9999-999999999999",
            countryCode: "US",
            displayName: "contoso",
            domains: ["contoso.net"],
            tenantCategory: "Home",
            defaultDomain: "contoso.net",
            tenantType: "AAD",
        },
    };

    protected subscriptions: { [subId: string]: Subscription } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000": {
            id: "/subscriptions/00000000-0000-0000-0000-000000000000",
            subscriptionId: "00000000-0000-0000-0000-000000000000",
            tenantId: "99999999-9999-9999-9999-999999999999",
            displayName: "tanuki",
            state: "Enabled",
            authorizationSource: "RoleBased",
            subscriptionPolicies: {
                locationPlacementId: "Fake_Placement_Id",
                quotaId: "Fake_Quota_Id",
            },
        },
        "/subscriptions/11111111-1111-1111-1111-111111111111": {
            id: "/subscriptions/11111111-1111-1111-1111-111111111111",
            subscriptionId: "11111111-1111-1111-1111-111111111111",
            tenantId: "99999999-9999-9999-9999-999999999999",
            displayName: "nekomata",
            state: "Enabled",
            authorizationSource: "RoleBased",
            subscriptionPolicies: {
                locationPlacementId: "Fake_Placement_Id",
                quotaId: "Fake_Quota_Id",
            },
        },
    };

    protected locations: { [locationId: string]: Location } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/locations/eastus":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/locations/eastus",
                name: "eastus",
                displayName: "East US",
                regionalDisplayName: "(US) East US",
                metadata: {
                    regionType: "Physical",
                    regionCategory: "Recommended",
                },
            },
        "/subscriptions/00000000-0000-0000-0000-000000000000/locations/southcentralus":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/locations/southcentralus",
                name: "southcentralus",
                displayName: "South Central US",
                regionalDisplayName: "(US) South Central US",
                metadata: {
                    regionType: "Physical",
                    regionCategory: "Recommended",
                },
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/locations/eastus":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/locations/eastus",
                name: "eastus",
                displayName: "East US",
                regionalDisplayName: "(US) East US",
                metadata: {
                    regionType: "Physical",
                    regionCategory: "Recommended",
                },
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/locations/westus":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/locations/westus",
                name: "westus",
                displayName: "West US",
                regionalDisplayName: "(US) West US",
                metadata: {
                    regionType: "Physical",
                    regionCategory: "Recommended",
                },
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/locations/southcentralus":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/locations/southcentralus",
                name: "southcentralus",
                displayName: "South Central US",
                regionalDisplayName: "(US) South Central US",
                metadata: {
                    regionType: "Physical",
                    regionCategory: "Recommended",
                },
            },
    };

    protected resourceGroups: { [rgId: string]: ResourceGroup } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing",
                name: "supercomputing",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "eastus",
            },
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/visualization":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization",
                name: "visualization",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "southcentralus",
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourcegroups/test":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/test",
                name: "test",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "southcentralus",
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourcegroups/staging":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/staging",
                name: "staging",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "southcentralus",
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourcegroups/production":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/production",
                name: "production",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "westus",
            },
    };

    protected storageAccounts: { [storageAccountId: string]: StorageAccount } =
        {
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.storage/storageAccounts/storageb":
                {
                    id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Storage/storageAccounts/storageB",
                    name: "storageB",
                    type: "Microsoft.Storage/storageAccounts",
                    location: "eastus",
                    kind: "Storage",
                    sku: {
                        name: "Standard_GRS",
                    },
                    properties: {
                        provisioningState: "Succeeded",
                    },
                },
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.storage/storageaccounts/storagea":
                {
                    id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Storage/storageAccounts/storageA",
                    name: "storageA",
                    type: "Microsoft.Storage/storageAccounts",
                    location: "eastus",
                    kind: "Storage",
                    sku: {
                        name: "Standard_GRS",
                    },
                    properties: {
                        provisioningState: "Succeeded",
                    },
                },
            "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/visualization/providers/microsoft.storage/storageaccounts/storagec":
                {
                    id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.Storage/storageAccounts/storageC",
                    name: "storageC",
                    type: "Microsoft.Storage/storageAccounts",
                    location: "southcentralus",
                    kind: "Storage",
                    sku: {
                        name: "Standard_GRS",
                    },
                    properties: {
                        provisioningState: "Succeeded",
                    },
                },
            "/subscriptions/11111111-1111-1111-1111-111111111111/resourcegroups/production/providers/microsoft.storage/storageaccounts/storagee":
                {
                    id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/production/providers/Microsoft.Storage/storageAccounts/storageE",
                    name: "storageE",
                    type: "Microsoft.Storage/storageAccounts",
                    location: "westus",
                    kind: "Storage",
                    sku: {
                        name: "Standard_GRS",
                    },
                    properties: {
                        provisioningState: "Succeeded",
                    },
                },
            "/subscriptions/11111111-1111-1111-1111-111111111111/resourcegroups/staging/providers/microsoft.storage/storageaccounts/storaged":
                {
                    id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/staging/providers/Microsoft.Storage/storageAccounts/storageD",
                    name: "storageD",
                    type: "Microsoft.Storage/storageAccounts",
                    location: "southcentralus",
                    kind: "Storage",
                    sku: {
                        name: "Standard_GRS",
                    },
                    properties: {
                        provisioningState: "Succeeded",
                    },
                },
        };
}
