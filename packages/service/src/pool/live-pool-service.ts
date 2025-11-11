// import { BatchApiVersion } from "../constants";
import type {
    LegacyPool,
    LegacyPoolOutput,
    Pool,
    PoolOutput,
} from "./pool-models";
import type { PoolService } from "./pool-service";
import {
    CustomHttpHeaders,
    HttpRequestMetadata,
    OperationOptions,
    UnexpectedStatusCodeError,
    getArmUrl,
    getHttpClient,
} from "@azure/bonito-core";
import { createARMBatchClient, isUnexpected } from "../internal/arm-batch-rest";
import {
    createArmUnexpectedStatusCodeError,
    parseBatchAccountIdInfo,
    parsePoolResourceIdInfo,
} from "../utils";

const SINGLE_POOL_PATH =
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}";

const POOLS_PATH =
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools";

export class LivePoolService implements PoolService {
    async createOrUpdate(
        poolResourceId: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const {
            subscriptionId,
            resourceGroupName,
            batchAccountName,
            poolName,
        } = parsePoolResourceIdInfo(poolResourceId);

        const res = await armBatchClient
            .path(
                SINGLE_POOL_PATH,
                subscriptionId,
                resourceGroupName,
                batchAccountName,
                poolName
            )
            .put({
                body: pool,
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "CreateOrUpdatePool",
                },
            });

        if (isUnexpected(res)) {
            throw createArmUnexpectedStatusCodeError(res);
        }

        return res.body;
    }

    async get(
        poolResourceId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const {
            subscriptionId,
            resourceGroupName,
            batchAccountName,
            poolName,
        } = parsePoolResourceIdInfo(poolResourceId);

        const res = await armBatchClient
            .path(
                SINGLE_POOL_PATH,
                subscriptionId,
                resourceGroupName,
                batchAccountName,
                poolName
            )
            .get({
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "GetPool",
                },
            });

        if (isUnexpected(res)) {
            throw createArmUnexpectedStatusCodeError(res);
        }

        return res.body;
    }

    async getLegacy(
        poolResourceId: string,
        opts?: OperationOptions
    ): Promise<LegacyPoolOutput | undefined> {
        let metadata: HttpRequestMetadata | undefined;
        if (opts?.commandName) {
            metadata = { commandName: opts.commandName };
        }

        const response = await getHttpClient().get(
            `${getArmUrl()}${poolResourceId}?api-version=2024-07-01`,
            {
                metadata,
            }
        );

        if (response.status !== 200) {
            throw new UnexpectedStatusCodeError(
                `Failed to get pool ${poolResourceId}`,
                response.status,
                await response.text()
            );
        }

        return (await response.json()) as LegacyPoolOutput;
    }

    async listByAccountId(
        batchAccountId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput[]> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const { subscriptionId, resourceGroupName, batchAccountName } =
            parseBatchAccountIdInfo(batchAccountId);

        const res = await armBatchClient
            .path(
                POOLS_PATH,
                subscriptionId,
                resourceGroupName,
                batchAccountName
            )
            .get({
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "ListPools",
                },
            });

        if (isUnexpected(res)) {
            throw createArmUnexpectedStatusCodeError(res);
        }

        return res.body.value ?? [];
    }

    async patch(
        poolResourceId: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const {
            subscriptionId,
            resourceGroupName,
            batchAccountName,
            poolName,
        } = parsePoolResourceIdInfo(poolResourceId);

        const res = await armBatchClient
            .path(
                SINGLE_POOL_PATH,
                subscriptionId,
                resourceGroupName,
                batchAccountName,
                poolName
            )
            .patch({
                body: pool,
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "PatchPool",
                },
            });

        if (isUnexpected(res)) {
            throw createArmUnexpectedStatusCodeError(res);
        }

        return res.body;
    }

    async patchLegacy(
        poolResourceId: string,
        pool: LegacyPool,
        opts?: OperationOptions
    ): Promise<LegacyPoolOutput> {
        let metadata: HttpRequestMetadata | undefined;
        if (opts?.commandName) {
            metadata = { commandName: opts.commandName };
        }

        // Use 2024-07-01 API version since node communication mode properties
        // were removed in subsequent versions.
        const response = await getHttpClient().patch(
            `${getArmUrl()}${poolResourceId}?api-version=2024-07-01`,
            {
                body: JSON.stringify(pool),
                headers: {
                    "Content-Type": "application/json",
                },
                metadata,
            }
        );

        if (response.status !== 200) {
            throw new UnexpectedStatusCodeError(
                `Failed to update pool ${poolResourceId}`,
                response.status,
                await response.text()
            );
        }

        return (await response.json()) as LegacyPoolOutput;
    }
}
