// import { BatchApiVersion } from "../constants";
import type { Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";
import {
    CustomHttpHeaders,
    OperationOptions,
    getArmUrl,
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
}
