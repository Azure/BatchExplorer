import { BatchAccountOutput, PoolOutput } from "@batch/arm-batch-rest";
import { Location } from "../location";
import { ResourceGroup } from "../resource-group";
import { Subscription } from "../subscription";
import { Tenant } from "../tenant";

/**
 * Represents an entire fake dataset which has been crafted to make sense
 * when taken as a whole (no bad references, etc)
 */
export interface FakeSet {
    tenants: { [tenantId: string]: Tenant };
    subscriptions: { [subId: string]: Subscription };
    locations: { [locationId: string]: Location };
    resourceGroups: { [rgId: string]: ResourceGroup };
    batchAccounts: { [accountId: string]: BatchAccountOutput };
    batchPools: { [poolId: string]: PoolOutput };

    /**
     * List subscriptions by tenant
     * @param tenantId Either the plain tenant ID or full ARM resource ID of
     *                 the tenant
     */
    listSubscriptionsByTenant(tenantId: string): Subscription[];

    /**
     * List locations by subscription
     * @param tenantId Either the plain subscription ID or full ARM resource ID of
     *                 the subscription
     */
    listLocationsBySubscription(subId: string): Location[];

    /**
     * List subscriptions by tenant
     * @param tenantId Either the plain subscription ID or full ARM resource ID of
     *                 the subscription
     */
    listResourceGroupsBySubscription(subId: string): ResourceGroup[];
}

export abstract class AbstractFakeSet implements FakeSet {
    abstract tenants: { [tenantId: string]: Tenant };
    abstract subscriptions: { [subId: string]: Subscription };
    abstract locations: { [locationId: string]: Location };
    abstract resourceGroups: { [rgId: string]: ResourceGroup };
    abstract batchAccounts: { [accountId: string]: BatchAccountOutput };
    abstract batchPools: { [poolId: string]: PoolOutput };

    listSubscriptionsByTenant(tenantId: string): Subscription[] {
        // Normalize to short tenant ID
        if (tenantId.startsWith("/tenants/")) {
            tenantId = tenantId.slice(9);
        }
        return Object.values(this.subscriptions).filter(
            (sub) => sub.tenantId === tenantId
        );
    }
    listLocationsBySubscription(subId: string): Location[] {
        // Normalize to subscription ARM resource ID
        if (!subId.startsWith("/subscriptions/")) {
            subId = "/subscriptions/" + subId;
        }
        return Object.values(this.locations).filter((location) =>
            location.id.startsWith(subId)
        );
    }
    listResourceGroupsBySubscription(subId: string): ResourceGroup[] {
        // Normalize to subscription ARM resource ID
        if (!subId.startsWith("/subscriptions/")) {
            subId = "/subscriptions/" + subId;
        }
        return Object.values(this.resourceGroups).filter((rg) =>
            rg.id.startsWith(subId)
        );
    }
}

export class BasicFakeSet extends AbstractFakeSet {
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
        },
        "/subscriptions/11111111-1111-1111-1111-111111111111": {
            id: "/subscriptions/11111111-1111-1111-1111-111111111111",
            subscriptionId: "11111111-1111-1111-1111-111111111111",
            tenantId: "99999999-9999-9999-9999-999999999999",
            displayName: "nekomata",
            state: "Enabled",
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
                location: "eastus",
            },
    };

    batchAccounts = {
        // TODO: Add at least 2 accounts
    };

    batchPools = {
        // TODO: Add at least 2 pools
    };
}
