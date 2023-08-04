import { BatchAccountOutput } from "../account/account-models";
import { Pool, PoolOutput } from "../pool/pool-models";
import { normalizeSubscriptionResourceId, normalizeTenantId } from "../arm";
import { Location } from "../location";
import { ResourceGroup } from "../resource-group";
import { StorageAccount } from "../storage";
import { Subscription } from "../subscription";
import { Tenant } from "../tenant";
import {
    cloneDeep,
    equalsIgnoreCase,
    mergeDeep,
    startsWithIgnoreCase,
} from "@batch/ui-common/lib/util";
import { toIsoLocal } from "@batch/ui-common";
import { getClock } from "@batch/ui-common/lib/datetime";

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
     * Get a Batch account by case-insensitive ID
     *
     * @param batchAccountId The ARM resource ID of the Batch account
     */
    getBatchAccount(batchAccountId: string): BatchAccountOutput | undefined;

    /**
     * List Batch accounts by subscription
     *
     * @param subscriptionId Either the plain subscription ID or full ARM
     *                       resource ID of the subscription
     */
    listBatchAccountsBySubscription(
        subscriptionId: string
    ): BatchAccountOutput[];

    /**
     * Get a Batch pool by case-insensitive ID
     *
     * @param poolArmId The ARM resource ID of the pool
     */
    getPool(poolArmId: string): PoolOutput | undefined;

    /**
     * Patches a pool and returns it
     */
    patchPool(pool: Pool): PoolOutput;

    /**
     * Creates or updates a pool and returns it
     */
    putPool(pool: Pool): PoolOutput;

    /**
     * List pools by Batch account
     *
     * @param subscriptionId The full ARM resource ID of the account
     */
    listPoolsByAccount(accountId: string): PoolOutput[];

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
    protected abstract batchAccounts: {
        [accountId: string]: BatchAccountOutput;
    };
    protected abstract batchPools: { [poolId: string]: PoolOutput };
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

    getBatchAccount(batchAccountId: string): BatchAccountOutput | undefined {
        return this.batchAccounts[batchAccountId.toLowerCase()];
    }

    listBatchAccountsBySubscription(subId: string): BatchAccountOutput[] {
        if (!subId) {
            return [];
        }
        subId = normalizeSubscriptionResourceId(subId);
        return Object.values(this.batchAccounts).filter((batchAccount) =>
            startsWithIgnoreCase(batchAccount.id, subId)
        );
    }

    getPool(poolArmId: string): PoolOutput | undefined {
        return this.batchPools[poolArmId.toLowerCase()];
    }

    listPoolsByAccount(accountId: string): PoolOutput[] {
        if (!accountId) {
            return [];
        }
        return Object.values(this.batchPools).filter((pool) =>
            startsWithIgnoreCase(pool.id, accountId)
        );
    }

    patchPool(pool: Pool): PoolOutput {
        if (!pool.id) {
            throw new Error("Cannot patch a pool without a valid ID");
        }

        const oldPool = this.getPool(pool.id);
        if (!oldPool) {
            throw new Error("No pool with ID " + pool.id);
        }

        return mergeDeep(oldPool, poolToOutput(pool));
    }

    putPool(pool: Pool): PoolOutput {
        if (!pool.id) {
            throw new Error("Cannot create/update a pool without a valid ID");
        }

        if (!this.getPool(pool.id)) {
            // KLUDGE: Using Pool and PoolOutput interchangeably here isn't
            // really right due to incompatibilities between the types (particularly
            // around dates). Either the SDK needs to fix this, or we need
            // some conversion code for fakes.
            const poolOutput = pool as PoolOutput;
            this.batchPools[pool.id] = poolOutput;
            return poolOutput;
        }

        return this.patchPool(pool);
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

    protected batchAccounts: { [accountId: string]: BatchAccountOutput } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.batch/batchaccounts/hobo":
            {
                name: "hobo",
                location: "eastus",
                properties: {
                    accountEndpoint: "mercury.eastus.batch.azure.com",
                    nodeManagementEndpoint:
                        "1234321.eastus.service.batch.azure.com",
                    provisioningState: "Succeeded",
                    poolAllocationMode: "BatchService",
                    dedicatedCoreQuota: 10000,
                    lowPriorityCoreQuota: 20000,
                    poolQuota: 50,
                    activeJobAndJobScheduleQuota: 100,
                    autoStorage: {
                        storageAccountId:
                            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Storage/storageAccounts/storageA",
                        lastKeySync: "2023-03-10T23:48:38.9878479Z",
                    },
                    publicNetworkAccess: "Enabled",
                },
                identity: {
                    type: "None",
                },
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/mercury",
                type: "Microsoft.Batch/batchAccounts",
            },
    };

    protected batchPools: { [poolId: string]: PoolOutput } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.batch/batchaccounts/hobo/pools/hobopool1":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Batch/batchAccounts/hobo/pools/hobopool1",
                name: "hobopool1",
                type: "Microsoft.Batch/batchAccounts/pools",
                etag: 'W/"0x8D4EDFEBFADF4AB"',
                properties: {
                    lastModified: "2022-08-28T10:22:55.9407275Z",
                    creationTime: "2022-08-28T10:22:55.9407275Z",
                    provisioningState: "Succeeded",
                    provisioningStateTransitionTime:
                        "2022-08-28T10:22:55.9407275Z",
                    allocationState: "Resizing",
                    allocationStateTransitionTime:
                        "2022-08-28T10:22:55.9407275Z",
                    vmSize: "STANDARD_DS3_V2",
                    interNodeCommunication: "Enabled",
                    taskSlotsPerNode: 2,
                    taskSchedulingPolicy: {
                        nodeFillType: "Pack",
                    },
                    deploymentConfiguration: {
                        virtualMachineConfiguration: {
                            imageReference: {
                                publisher: "Canonical",
                                offer: "0001-com-ubuntu-server-focal",
                                sku: "20_04-lts",
                            },
                            nodeAgentSkuId: "batch.node.ubuntu 20.04",
                            extensions: [
                                {
                                    name: "batchextension1",
                                    type: "SecurityMonitoringForLinux",
                                    publisher:
                                        "Microsoft.Azure.Security.Monitoring",
                                    typeHandlerVersion: "1.0",
                                    autoUpgradeMinorVersion: true,
                                    settings: {
                                        settingsKey: "settingsValue",
                                    },
                                },
                            ],
                        },
                    },
                    scaleSettings: {
                        fixedScale: {
                            targetDedicatedNodes: 50,
                            targetLowPriorityNodes: 100,
                            resizeTimeout: "PT8M",
                        },
                    },
                    networkConfiguration: {
                        subnetId:
                            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Network/virtualNetworks/vnetA/subnets/subnetA",
                        endpointConfiguration: {
                            inboundNatPools: [
                                {
                                    name: "testnat",
                                    protocol: "TCP",
                                    backendPort: 12001,
                                    frontendPortRangeStart: 15000,
                                    frontendPortRangeEnd: 15100,
                                    networkSecurityGroupRules: [
                                        {
                                            access: "Allow",
                                            sourceAddressPrefix:
                                                "192.100.12.45",
                                            priority: 150,
                                            sourcePortRanges: ["123", "22"],
                                        },
                                        {
                                            access: "Deny",
                                            sourceAddressPrefix: "*",
                                            priority: 3500,
                                            sourcePortRanges: ["*"],
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                    metadata: [
                        {
                            name: "metadata-1",
                            value: "value-1",
                        },
                        {
                            name: "metadata-2",
                            value: "value-2",
                        },
                    ],
                    startTask: {
                        commandLine: "cmd /c SET",
                        resourceFiles: [
                            {
                                httpUrl:
                                    "https://test.blob.core.windows.net/example.txt",
                                filePath: "/tmp/example.txt",
                                fileMode: "777",
                            },
                        ],
                        environmentSettings: [
                            {
                                name: "TEST",
                                value: "1234",
                            },
                        ],
                        userIdentity: {
                            autoUser: {
                                scope: "Pool",
                                elevationLevel: "Admin",
                            },
                        },
                        maxTaskRetryCount: 6,
                        waitForSuccess: true,
                    },
                    userAccounts: [
                        {
                            name: "username1",
                            elevationLevel: "Admin",
                            linuxUserConfiguration: {
                                uid: 1234,
                                gid: 4567,
                            },
                        },
                    ],
                    currentDedicatedNodes: 0,
                    currentLowPriorityNodes: 0,
                    resizeOperationStatus: {
                        startTime: "2022-08-28T10:22:55.9407275Z",
                        targetDedicatedNodes: 50,
                        targetLowPriorityNodes: 100,
                        nodeDeallocationOption: "TaskCompletion",
                        resizeTimeout: "PT8M",
                    },
                },
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

/**
 * Convert a Pool model to a PoolOutput model while setting lastModified
 *
 * @param pool The input pool
 * @returns The output model with a lastModified date of now
 */
function poolToOutput(pool: Pool): PoolOutput {
    const clone = cloneDeep(pool);

    // KLUDGE: Properties shouldn't be nullable, but since it is right now, handle it.
    clone.properties = clone.properties ?? {};
    clone.properties.lastModified = toIsoLocal(getClock().now());

    return clone as PoolOutput;
}
