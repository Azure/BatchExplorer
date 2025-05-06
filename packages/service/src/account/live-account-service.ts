import {
    CustomHttpHeaders,
    OperationOptions,
    getArmUrl,
    getCacheManager,
} from "@azure/bonito-core";
import {
    AccountBatchUpdateParameters,
    BatchAccountOutput,
} from "../arm-batch-models";
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
    ): Promise<BatchAccountOutput | undefined> {
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
                if (res.status === "404") {
                    return undefined;
                }
                throw createArmUnexpectedStatusCodeError(res);
            }

            return res.body;
        };
        return cacheManager.getOrAdd(cacheKey, _get, { bypassCache });
    }

    async patch(
        accountResouceId: string,
        body: AccountBatchUpdateParameters,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput | undefined> {
        const { subscriptionId, resourceGroupName, batchAccountName } =
            parseBatchAccountIdInfo(accountResouceId);
        const armBatchClient = createARMBatchClient({
            baseUrl: getArmUrl(),
        });

        const res = await armBatchClient
            .path(
                "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}",
                subscriptionId,
                resourceGroupName,
                batchAccountName
            )
            .patch({
                body,
                headers: {
                    [CustomHttpHeaders.CommandName]:
                        opts?.commandName ?? "PatchAccount",
                },
            });

        if (isUnexpected(res)) {
            if (res.status === "404") {
                return undefined;
            }
            throw createArmUnexpectedStatusCodeError(res);
        }

        return res.body;
    }
}
