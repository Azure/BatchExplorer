import {
    Location,
    ResourceGroup,
    StorageAccount,
    Subscription,
    Tenant,
    cloneDeep,
    getClock,
    mergeDeep,
    normalizeSubscriptionResourceId,
    startsWithIgnoreCase,
    toIsoLocal,
} from "@azure/bonito-core";
import { AbstractFakeSet, FakeSet } from "@azure/bonito-core/lib/test-util";
import { BatchAccountOutput } from "../account/account-models";
import {
    BatchNodeOutput,
    BatchNodeVMExtensionOutput,
} from "../node/node-models";
import { Pool, PoolOutput } from "../pool/pool-models";
import { BatchJobOutput, BatchTaskOutput } from "../batch-models";
import {
    AccountBatchUpdateParameters,
    NetworkSecurityPerimeterConfigurationListResultOutput,
} from "../arm-batch-models";

/**
 * A fake dataset which includes Batch accounts, pools, etc.
 */
export interface BatchFakeSet extends FakeSet {
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
     * @param poolResourceId The ARM resource ID of the pool
     */
    getPool(poolResourceId: string): PoolOutput | undefined;

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
     * Get a single Batch node
     *
     * @param accountEndpoint The Batch account endpoint (with no protocol)
     * @param poolName The name of the pool (globally unique for fakes)
     * @param nodeId The 'id' property of the node
     */
    getNode(
        accountEndpoint: string,
        poolName: string,
        nodeId: string
    ): BatchNodeOutput;

    /**
     * List Batch nodes
     *
     * @param accountEndpoint The Batch account endpoint (with no protocol)
     * @param poolName The name of the pool (globally unique for fakes)
     */
    listNodes(accountEndpoint: string, poolName: string): BatchNodeOutput[];

    /**
     * List VM extensions for a given node
     *
     * @param nodeId The node ID (currently globally unique for fakes)
     */
    listVmExtensions(nodeId: string): BatchNodeVMExtensionOutput[];

    /**
     * Get a single task
     *
     * @param accountEndpoint
     * @param jobId
     * @param taskId
     */
    getTask(
        accountEndpoint: string,
        jobId: string,
        taskId: string
    ): BatchTaskOutput;

    /**
     * List Task for a given job
     *
     * @param accountEndpoint
     * @param jobId
     */
    listTasks(accountEndpoint: string, jobId: string): BatchTaskOutput[];

    /**
     * update a batch account and return it
     *
     * @param accountResouceId The resource id of the account
     * @param parameters The parameters to update the account with
     * @param opts
     *
     */
    patchBatchAccount(
        accountResouceId: string,
        parameters: AccountBatchUpdateParameters
    ): BatchAccountOutput | undefined;

    listNetworkSecurityPerimeterConfigurations(
        accountResouceId: string
    ): NetworkSecurityPerimeterConfigurationListResultOutput;
}

export abstract class AbstractBatchFakeSet
    extends AbstractFakeSet
    implements BatchFakeSet
{
    abstract defaultTenantArmId: string;

    protected abstract batchAccounts: {
        [accountId: string]: BatchAccountOutput;
    };
    protected abstract batchPools: { [poolId: string]: PoolOutput };

    /**
     * Node key is the account endpoint, pool name and node ID concatenated,
     * colon-separated and lower-cased
     */
    protected abstract batchNodes: { [nodeKey: string]: BatchNodeOutput };

    protected abstract batchNodeExtensions: {
        [nodeId: string]: BatchNodeVMExtensionOutput[];
    };

    protected abstract batchTasks: { [taskKey: string]: BatchTaskOutput };

    protected networkSecurityPerimeterConfigurations: {
        [
            accountId: string
        ]: NetworkSecurityPerimeterConfigurationListResultOutput;
    } = {};

    getBatchAccount(batchAccountId: string): BatchAccountOutput | undefined {
        return this.batchAccounts[batchAccountId.toLowerCase()];
    }

    patchBatchAccount(
        accountResouceId: string,
        parameters: AccountBatchUpdateParameters
    ): BatchAccountOutput | undefined {
        const batchAccount = this.getBatchAccount(accountResouceId);
        if (!batchAccount) {
            throw new Error("No batch account with ID " + accountResouceId);
        }

        const oldAccount = cloneDeep(batchAccount);

        return mergeDeep(oldAccount, parameters as BatchAccountOutput);
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

    getPool(poolResourceId: string): PoolOutput | undefined {
        return this.batchPools[poolResourceId.toLowerCase()];
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

    getNode(
        accountEndpoint: string,
        poolResourceId: string,
        nodeId: string
    ): BatchNodeOutput {
        return this.batchNodes[
            `${accountEndpoint}:${poolResourceId}:${nodeId}`.toLowerCase()
        ];
    }

    listNodes(
        accountEndpoint: string,
        poolResourceId: string
    ): BatchNodeOutput[] {
        if (!poolResourceId) {
            return [];
        }

        return Object.entries(this.batchNodes)
            .filter((entry) =>
                startsWithIgnoreCase(
                    entry[0],
                    `${accountEndpoint}:${poolResourceId}`.toLowerCase()
                )
            )
            .map((entry) => entry[1]);
    }

    listVmExtensions(nodeId: string): BatchNodeVMExtensionOutput[] {
        return this.batchNodeExtensions[nodeId] ?? [];
    }

    getTask(
        accountEndpoint: string,
        jobId: string,
        taskId: string
    ): BatchTaskOutput {
        return this.batchTasks[
            `${accountEndpoint}:${jobId}:${taskId}`.toLowerCase()
        ];
    }

    listTasks(accountEndpoint: string, jobId: string): BatchTaskOutput[] {
        if (!jobId) {
            return [];
        }

        return Object.entries(this.batchTasks)
            .filter((entry) =>
                startsWithIgnoreCase(
                    entry[0],
                    `${accountEndpoint}:${jobId}`.toLowerCase()
                )
            )
            .map((entry) => entry[1]);
    }

    listNetworkSecurityPerimeterConfigurations(
        accountResouceId: string
    ): NetworkSecurityPerimeterConfigurationListResultOutput {
        const res =
            this.networkSecurityPerimeterConfigurations[
                accountResouceId.toLowerCase()
            ];
        if (!res) {
            return {
                value: [],
            };
        }
        return res;
    }
}

export class BasicBatchFakeSet extends AbstractBatchFakeSet {
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
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/visualization/providers/microsoft.batch/batchaccounts/byos":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.Batch/batchAccounts/byos",
                name: "byos",
                type: "Microsoft.Batch/batchAccounts",
                location: "eastus",
                properties: {
                    accountEndpoint: "byos.eastus.batch.azure.com",
                    nodeManagementEndpoint:
                        "6b5a23b7-ac5f-49a3-ab3d-b0a6c72292a5.eastus.service.batch.azure.com",
                    provisioningState: "Succeeded",
                    dedicatedCoreQuotaPerVMFamilyEnforced: true,
                    poolQuota: 100,
                    activeJobAndJobScheduleQuota: 300,
                    poolAllocationMode: "UserSubscription",
                    keyVaultReference: {
                        id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.KeyVault/vaults/byoskeyvault",
                        url: "https://byoskeyvault.vault.azure.net/",
                    },
                    publicNetworkAccess: "Enabled",
                    networkProfile: {
                        accountAccess: {
                            defaultAction: "Allow",
                        },
                    },
                    privateEndpointConnections: [],
                    encryption: {
                        keySource: "Microsoft.Batch",
                    },
                    allowedAuthenticationModes: [
                        "AAD",
                        "TaskAuthenticationToken",
                    ],
                },
                identity: {
                    type: "UserAssigned",
                    userAssignedIdentities: {
                        "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.ManagedIdentity/userAssignedIdentities/byos-identity":
                            {
                                principalId:
                                    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                                clientId:
                                    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                            },
                    },
                },
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
                            password: "password1",
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
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/visualization/providers/microsoft.batch/batchaccounts/byos/pools/byospool1":
            {
                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/visualization/providers/Microsoft.Batch/batchAccounts/byos/pools/byospool1",
                name: "byospool1",
                type: "Microsoft.Batch/batchAccounts/pools",
                etag: 'W/"0x8DC2F2FC68C6235"',
                properties: {
                    lastModified: "2024-02-16T20:42:22.0825141Z",
                    creationTime: "2024-02-16T20:42:22.0825141Z",
                    provisioningState: "Succeeded",
                    provisioningStateTransitionTime:
                        "2024-02-16T20:42:22.0825141Z",
                    allocationState: "Steady",
                    allocationStateTransitionTime:
                        "2024-02-16T20:42:23.6365371Z",
                    vmSize: "STANDARD_D2S_V3",
                    interNodeCommunication: "Disabled",
                    taskSlotsPerNode: 1,
                    taskSchedulingPolicy: {
                        nodeFillType: "Pack",
                    },
                    deploymentConfiguration: {
                        virtualMachineConfiguration: {
                            imageReference: {
                                publisher: "canonical",
                                offer: "0001-com-ubuntu-server-jammy",
                                sku: "22_04-lts",
                                version: "latest",
                            },
                            nodeAgentSkuId: "batch.node.ubuntu 22.04",
                            osDisk: {
                                caching: "None",
                                managedDisk: {
                                    storageAccountType: "Premium_LRS",
                                },
                            },
                            nodePlacementConfiguration: {
                                policy: "Regional",
                            },
                            securityProfile: {
                                securityType: "trustedLaunch",
                                uefiSettings: {
                                    secureBootEnabled: true,
                                },
                            },
                        },
                    },
                    networkConfiguration: {
                        subnetId:
                            "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/supercomputing/providers/Microsoft.Network/virtualNetworks/vnetA/subnets/subnetA",
                        publicIPAddressConfiguration: {
                            provision: "BatchManaged",
                        },
                        dynamicVnetAssignmentScope: "none",
                        enableAcceleratedNetworking: false,
                    },
                    scaleSettings: {
                        fixedScale: {
                            targetDedicatedNodes: 0,
                            targetLowPriorityNodes: 0,
                            resizeTimeout: "PT15M",
                        },
                    },
                    resizeOperationStatus: {
                        targetDedicatedNodes: 0,
                        nodeDeallocationOption: "Requeue",
                        resizeTimeout: "PT15M",
                        startTime: "2024-02-16T20:42:22.0825141Z",
                    },
                    currentDedicatedNodes: 0,
                    currentLowPriorityNodes: 0,
                    targetNodeCommunicationMode: "Default",
                    resourceTags: {
                        tag1: "one",
                        tag2: "two",
                    },
                },
            },
    };

    batchNodes: { [nodeKey: string]: BatchNodeOutput } = {
        "mercury.eastus.batch.azure.com:hobopool1:tvmps_id1": {
            id: "tvmps_id1",
            url: "https://account.region.batch.azure.com/pools/hobopool1/nodes/tvmps_id1",
            state: "starting",
            schedulingState: "enabled",
            stateTransitionTime: "2023-11-09T07:20:55.000Z",
            allocationTime: "2023-11-09T07:20:45.000Z",
            ipAddress: "10.0.0.4",
            affinityId:
                "TVM:tvmps_7b5797648c5d43f7a15b952e5ada3c082ccac8de5eb95f5518ab1242bc79aa3b_d",
            vmSize: "standard_d2_v2",
            totalTasksRun: 0,
            runningTasksCount: 0,
            runningTaskSlotsCount: 0,
            totalTasksSucceeded: 0,
            isDedicated: true,
            endpointConfiguration: {
                inboundEndpoints: [
                    {
                        name: "SSHRule.0",
                        protocol: "tcp",
                        publicIPAddress: "20.24.241.25",
                        publicFQDN: "cloudservice.region.cloudapp.azure.com",
                        frontendPort: 50000,
                        backendPort: 3389,
                    },
                ],
            },
            virtualMachineInfo: {
                imageReference: {
                    publisher: "microsoftwindowsserver",
                    offer: "windowsserver",
                    sku: "2022-datacenter",
                    version: "latest",
                    exactVersion: "20348.2031.231006",
                },
            },
        },
    };

    batchJobs: { [poolId: string]: BatchJobOutput[] } = {
        hobopool1: [
            {
                id: "faketestjob1",
                usesTaskDependencies: false,
                url: "https://batchsyntheticsprod.eastus2euap.batch.azure.com/jobs/faketestjob1",
                lastModified: "2024-05-29T08:32:21.000Z",
                creationTime: "2024-05-29T08:32:21.000Z",
                state: "active",
                stateTransitionTime: "2024-05-29T08:32:21.000Z",
                priority: 2,
                constraints: {
                    maxWallClockTime: "P10675199DT2H48M5.4775807S",
                    maxTaskRetryCount: 0,
                },
                poolInfo: {
                    poolId: "hobopool1",
                },
                onAllTasksComplete: "noaction",
                onTaskFailure: "noaction",
                executionInfo: {
                    startTime: "2024-05-29T08:32:21.000Z",
                    poolId: "Syn_20240529_a0f9af6251964f449a0b1052b58",
                },
            },
        ],
    };

    batchTasks: { [taskKey: string]: BatchTaskOutput } = {
        "mercury.eastus.batch.azure.com:faketestjob1:taska": {
            url: "https://batchsyntheticsprod.eastus2euap.batch.azure.com/jobs/faketestjob1/tasks/taskA",
            id: "taska",
            state: "active",
            executionInfo: {
                retryCount: 0,
                requeueCount: 0,
            },
        },
        "mercury.eastus.batch.azure.com:faketestjob1:task1": {
            url: "https://batchsyntheticsprod.eastus2euap.batch.azure.com/jobs/faketestjob1/tasks/task1",
            id: "task1",
            state: "completed",
            executionInfo: {
                retryCount: 0,
                requeueCount: 0,
            },
        },
    };

    batchNodeExtensions: { [nodeId: string]: BatchNodeVMExtensionOutput[] } = {
        tvmps_id1: [
            {
                provisioningState: "Succeeded",
                instanceView: {
                    name: "CustomExtension100",
                    statuses: [
                        {
                            code: "ProvisioningState/succeeded",
                            level: "0",
                            displayStatus: "Provisioning succeeded",
                            message:
                                "ExtensionOperation:enable. Status:Success",
                            time: "11/9/2023 7:44:19 AM",
                        },
                    ],
                },
                vmExtension: {
                    name: "CustomExtension100",
                    publisher: "Microsoft.Azure.Geneva",
                    type: "GenevaMonitoring",
                    typeHandlerVersion: "2.0",
                    autoUpgradeMinorVersion: true,
                    enableAutomaticUpgrade: true,
                    settings: {
                        applicationId: "settings1",
                        version: "3.3.3",
                    },
                },
            },
        ],
    };

    networkSecurityPerimeterConfigurations: {
        [
            accountId: string
        ]: NetworkSecurityPerimeterConfigurationListResultOutput;
    } = {
        "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.batch/batchaccounts/hobo":
            {
                value: [
                    {
                        id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourcegroups/supercomputing/providers/microsoft.batch/batchaccounts/hobo/networkSecurityPerimeterConfigurations/00000000-0000-0000-0000-000000000000.abcd",
                        name: "00000000-0000-0000-0000-000000000000.resourceAssociationName",
                        type: "Microsoft.Batch/batchAccounts/networkSecurityPerimeterConfigurations",
                        properties: {
                            provisioningState: "Succeeded",
                            provisioningIssues: [
                                {
                                    name: "issue1",
                                },
                                {
                                    name: "issue2",
                                },
                            ],
                            networkSecurityPerimeter: {
                                id: "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/npipv2/providers/Microsoft.Network/networkSecurityPerimeters/nspname",
                                perimeterGuid:
                                    "00000000-0000-0000-0000-000000000000",
                                location: "eastus2euap",
                            },
                            resourceAssociation: {
                                name: "resourceAssociationName",
                                accessMode: "Enforced",
                            },
                            profile: {
                                name: "default",
                                accessRulesVersion: 5,
                                accessRules: [
                                    {
                                        name: "test",
                                        properties: {
                                            direction: "Inbound",
                                            addressPrefixes: [
                                                "111.111.111.111/32",
                                            ],
                                            fullyQualifiedDomainNames: [],
                                            subscriptions: [],
                                            networkSecurityPerimeters: [],
                                            emailAddresses: [],
                                            phoneNumbers: [],
                                        },
                                    },
                                    {
                                        name: "rule2",
                                        properties: {
                                            direction: "Outbound",
                                            addressPrefixes: [],
                                            fullyQualifiedDomainNames: ["*"],
                                            subscriptions: [],
                                            networkSecurityPerimeters: [],
                                            emailAddresses: [],
                                            phoneNumbers: [],
                                        },
                                    },
                                ],
                                diagnosticSettingsVersion: 0,
                                enabledLogCategories: [
                                    "NspPublicInboundPerimeterRulesAllowed",
                                    "NspPublicInboundPerimeterRulesDenied",
                                    "NspPublicOutboundPerimeterRulesAllowed",
                                    "NspPublicOutboundPerimeterRulesDenied",
                                    "NspIntraPerimeterOutboundAllowed",
                                    "NspPublicInboundResourceRulesAllowed",
                                    "NspPublicInboundResourceRulesDenied",
                                    "NspPublicOutboundResourceRulesAllowed",
                                    "NspPublicOutboundResourceRulesDenied",
                                    "NspPrivateInboundAllowed",
                                    "NspIntraPerimeterInboundAllowed",
                                    "NspOutboundAttempt",
                                    "NspCrossPerimeterInboundAllowed",
                                    "NspCrossPerimeterOutboundAllowed",
                                ],
                            },
                        },
                    },
                ],
            },
        "/subscriptions/11111111-1111-1111-1111-111111111111/resourcegroups/test/providers/microsoft.batch/batchaccounts/hobo":
            {
                value: [],
                nextLink: undefined,
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
