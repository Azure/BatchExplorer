import { BatchAccountOutput, PoolOutput } from "@batch/arm-batch-rest";
import { normalizeSubscriptionResourceId, normalizeTenantId } from "../arm";
import { Location } from "../location";
import { ResourceGroup } from "../resource-group";
import { StorageAccount } from "../storage";
import { Subscription } from "../subscription";
import { Tenant } from "../tenant";

/**
 * Represents an entire fake dataset which has been crafted to make sense
 * when taken as a whole (no bad references, etc)
 */
export interface FakeSet {
    defaultTenantArmId: string;
    tenants: { [tenantArmId: string]: Tenant };
    subscriptions: { [subArmId: string]: Subscription };
    locations: { [locationArmId: string]: Location };
    resourceGroups: { [rgId: string]: ResourceGroup };
    batchAccounts: { [accountId: string]: BatchAccountOutput };
    batchPools: { [poolId: string]: PoolOutput };
    storageAccounts: { [storageAccountId: string]: StorageAccount };

    /**
     * Lists tenants in the fake set
     */
    listTenants(): Tenant[];

    /**
     * List subscriptions by the global default tenant of the fake set
     */
    listSubscriptionsByDefaultTenant(): Subscription[];

    /**
     * List subscriptions by tenant
     *
     * @param tenantId Either the plain tenant ID or full ARM resource ID of
     *                 the tenant
     */
    listSubscriptionsByTenant(tenantId: string): Subscription[];

    /**
     * List locations by subscription
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    listLocationsBySubscription(subscriptionId: string): Location[];

    /**
     * List resource groups by subscription
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    listResourceGroupsBySubscription(subscriptionId: string): ResourceGroup[];

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
    abstract tenants: { [tenantArmId: string]: Tenant };
    abstract subscriptions: { [subArmId: string]: Subscription };
    abstract locations: { [locationArmId: string]: Location };
    abstract resourceGroups: { [rgId: string]: ResourceGroup };
    abstract batchAccounts: { [accountId: string]: BatchAccountOutput };
    abstract batchPools: { [poolId: string]: PoolOutput };
    abstract storageAccounts: { [storageAccountId: string]: StorageAccount };

    listTenants(): Tenant[] {
        return Object.values(this.tenants);
    }

    listSubscriptionsByDefaultTenant(): Subscription[] {
        return this.listSubscriptionsByTenant(this.defaultTenantArmId);
    }

    listSubscriptionsByTenant(tenantId: string): Subscription[] {
        if (!tenantId) {
            return [];
        }
        tenantId = normalizeTenantId(tenantId);
        return Object.values(this.subscriptions).filter(
            (sub) => sub.tenantId === tenantId
        );
    }

    listLocationsBySubscription(subId: string): Location[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.locations).filter((location) =>
            location.id.startsWith(subId)
        );
    }

    listResourceGroupsBySubscription(subId: string): ResourceGroup[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.resourceGroups).filter((rg) =>
            rg.id.startsWith(subId)
        );
    }

    listStorageAccountsBySubscription(subId: string): StorageAccount[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.storageAccounts).filter((storageAcct) =>
            storageAcct.id.startsWith(subId)
        );
    }
}

export class BasicFakeSet extends AbstractFakeSet {
    defaultTenantArmId: string =
        "/tenants/99999999-9999-9999-9999-999999999999";

    tenants: { [tenantId: string]: Tenant } = {
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

    subscriptions: { [subId: string]: Subscription } = {
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

    locations: { [locationId: string]: Location } = {
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

    resourceGroups: { [rgId: string]: ResourceGroup } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing",
                name: "supercomputing",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "eastus",
            },
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization",
                name: "visualization",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "southcentralus",
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/test":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/test",
                name: "test",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "southcentralus",
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/staging":
            {
                id: "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/staging",
                name: "staging",
                type: "Microsoft.Resources/resourceGroups",
                properties: {
                    provisioningState: "Succeeded",
                },
                location: "southcentralus",
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/production":
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

    batchAccounts = {
        // TODO: Add at least 2 accounts
    };

    batchPools = {
        // TODO: Add at least 2 pools
    };

    storageAccounts: { [storageAccountId: string]: StorageAccount } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Storage/storageAccounts/storageB":
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
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Storage/storageAccounts/storageA":
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
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.Storage/storageAccounts/storageC":
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
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/production/providers/Microsoft.Storage/storageAccounts/storageE":
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
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourceGroups/staging/providers/Microsoft.Storage/storageAccounts/storageD":
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
