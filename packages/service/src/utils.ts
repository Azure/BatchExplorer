import { HttpResponse as AzureCoreHttpResponse } from "@azure-rest/core-client";
import { UnexpectedStatusCodeError } from "@azure/bonito-core";
import { CloudErrorOutput } from "./internal/arm-batch-rest";
import { BatchErrorOutput } from "./internal/batch-rest";

const batchAccountIdRegex =
    /\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/Microsoft.Batch\/batchAccounts\/(.*)/i;

const poolResourceIdRegex =
    /\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/Microsoft.Batch\/batchAccounts\/(.*)\/pools\/(.*)/i;

interface ErrorResponse extends AzureCoreHttpResponse {
    status: string;
    body: BatchErrorOutput | CloudErrorOutput;
}

export interface BatchAccountIdInfo {
    subscriptionId: string;
    resourceGroupName: string;
    batchAccountName: string;
}

export function createArmUnexpectedStatusCodeError(
    res: ErrorResponse
): UnexpectedStatusCodeError {
    return createUnexpectedStatusCodeError(
        `The Batch management plane returned an unexpected status code`,
        res
    );
}

export function createBatchUnexpectedStatusCodeError(
    res: ErrorResponse
): UnexpectedStatusCodeError {
    return createUnexpectedStatusCodeError(
        `The Batch data plane returned an unexpected status code`,
        res
    );
}

export function createUnexpectedStatusCodeError(
    msg: string,
    res: ErrorResponse
): UnexpectedStatusCodeError {
    return new UnexpectedStatusCodeError(
        msg,
        +res.status,
        JSON.stringify(res.body)
    );
}

/**
 *
 * @param oriBatchAccountId is of the form:
 * /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}
 * case-insensitive
 */
export function parseBatchAccountIdInfo(
    oriBatchAccountId: string
): BatchAccountIdInfo {
    // use regex to parse the batch account id
    const batchAccountId = ensureRelativeUrl(oriBatchAccountId);
    const match = batchAccountId.match(batchAccountIdRegex);
    if (!match) {
        throw new Error(`Unable to parse batch account id: ${batchAccountId}`);
    }
    const [, subscriptionId, resourceGroupName, batchAccountName] = match;
    return {
        subscriptionId,
        resourceGroupName,
        batchAccountName,
    };
}

/**
 *
 * @param oriPoolResourceId is of the form:
 * /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}F
 * case-insensitive
 */
export function parsePoolResourceIdInfo(oriPoolResourceId: string): {
    subscriptionId: string;
    resourceGroupName: string;
    batchAccountName: string;
    poolName: string;
} {
    // use regex to parse the batch account id
    const poolResourceId = ensureRelativeUrl(oriPoolResourceId);
    const match = poolResourceId.match(poolResourceIdRegex);
    if (!match) {
        throw new Error(`Unable to parse pool ARM id: ${poolResourceId}`);
    }
    const [, subscriptionId, resourceGroupName, batchAccountName, poolName] =
        match;
    return {
        subscriptionId,
        resourceGroupName,
        batchAccountName,
        poolName,
    };
}

export function ensureRelativeUrl(untrustedUrlString: string): string {
    let relative = null;

    try {
        // Treat input as absolute, make relative
        const absolute = new URL(untrustedUrlString);
        relative = absolute.href.slice(absolute.origin.length);
    } catch {
        // Input was already relative
        relative = untrustedUrlString;
    }

    if (!relative) {
        relative = "";
    }
    if (relative != "" && !relative.startsWith("/")) {
        relative = "/" + relative;
    }

    // Normalize any leading '/' or '\' characters
    relative = relative.replace(/^[/\\]+/, "/");

    // Return relative url
    return relative;
}
