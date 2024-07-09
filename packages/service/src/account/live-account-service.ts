import {
    CustomHttpHeaders,
    OperationOptions,
    getArmUrl,
    getCacheManager,
} from "@azure/bonito-core";
import { BatchAccountOutput } from "../arm-batch-models";
import { AccountService } from "./account-service";
import { createARMBatchClient, isUnexpected } from "../internal/arm-batch-rest";
import {
    createArmUnexpectedStatusCodeError,
    parseBatchAccountIdInfo,
} from "../utils";

export class LiveAccountService implements AccountService {
    async get(
        accountResouceId: string,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput> {
        const { subscriptionId, resourceGroupName, batchAccountName } =
            parseBatchAccountIdInfo(accountResouceId);
        const cacheManager = getCacheManager();
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const cacheKey = `get-${accountResouceId}`;
        const { bypassCache } = opts ?? {};

        const _get = async () => {
            const res = await armBatchClient
                .path(
                    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}",
                    subscriptionId,
                    resourceGroupName,
                    batchAccountName
                )
                .get({
                    headers: {
                        [CustomHttpHeaders.CommandName]:
                            opts?.commandName ?? "GetAccount",
                    },
                });

            if (isUnexpected(res)) {
                throw createArmUnexpectedStatusCodeError(res);
            }

            return res.body;
        };
        return cacheManager.getOrAdd(cacheKey, _get, { bypassCache });
    }
}
