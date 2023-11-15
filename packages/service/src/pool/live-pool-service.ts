// import { BatchApiVersion } from "../constants";
import type { Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";
import {
    // getHttpClient,
    // StandardHttpHeaders,
    // MediaType,
    AbstractHttpService,
    OperationOptions,
    getArmUrl,
    // buildRequestMetadata,
} from "@azure/bonito-core";
import { createARMBatchClient, isUnexpected } from "../internal/arm-batch-rest";
import {
    createUnexpectedStatusCodeError,
    parseBatchAccountIdInfo,
} from "../utils";

const SINGLE_POOL_PATH =
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}";

const POOLS_PATH =
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools";

export class LivePoolService
    extends AbstractHttpService
    implements PoolService
{
    async createOrUpdate(
        batchAccountId: string,
        poolName: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const { subscriptionId, resourceGroupName, batchAccountName } =
            parseBatchAccountIdInfo(batchAccountId);

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
                headers: {},
            });

        if (isUnexpected(res)) {
            throw createUnexpectedStatusCodeError(res);
        }

        return res.body;
    }

    async get(
        batchAccountId: string,
        poolName: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const { subscriptionId, resourceGroupName, batchAccountName } =
            parseBatchAccountIdInfo(batchAccountId);

        const res = await armBatchClient
            .path(
                SINGLE_POOL_PATH,
                subscriptionId,
                resourceGroupName,
                batchAccountName,
                poolName
            )
            .get();

        if (isUnexpected(res)) {
            throw createUnexpectedStatusCodeError(res);
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
            .get();

        if (isUnexpected(res)) {
            throw createUnexpectedStatusCodeError(res);
        }

        return res.body.value ?? [];
    }

    async patch(
        batchAccountId: string,
        poolName: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput> {
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const { subscriptionId, resourceGroupName, batchAccountName } =
            parseBatchAccountIdInfo(batchAccountId);

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
                headers: {},
            });

        if (isUnexpected(res)) {
            throw createUnexpectedStatusCodeError(res);
        }

        return res.body;
    }
}
