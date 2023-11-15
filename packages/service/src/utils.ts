import { HttpResponse as AzureCoreHttpResponse } from "@azure-rest/core-client";
import { UnexpectedStatusCodeError } from "@azure/bonito-core";
import { CloudErrorOutput } from "./internal/arm-batch-rest";
import { BatchErrorOutput } from "./internal/batch-rest";

interface ErrorResponse extends AzureCoreHttpResponse {
    status: string;
    body: BatchErrorOutput | CloudErrorOutput;
}

export interface BatchAccountIdInfo {
    subscriptionId: string;
    resourceGroupName: string;
    batchAccountName: string;
}

export function createUnexpectedStatusCodeError(
    res: ErrorResponse
): UnexpectedStatusCodeError {
    return new UnexpectedStatusCodeError(
        "The Batch data plane returned an unexpected status code",
        +res.status,
        JSON.stringify(res.body)
    );
}

/**
 *
 * @param batchAccountId is of the form:
 * /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}
 * case-insensitive
 */
export function parseBatchAccountIdInfo(
    oriBatchAccountId: string
): BatchAccountIdInfo {
    // use regex to parse the batch account id
    const batchAccountId = ensureRelativeUrl(oriBatchAccountId);
    const regex =
        /\/subscriptions\/(.*)\/resourceGroups\/(.*)\/providers\/Microsoft.Batch\/batchAccounts\/(.*)/i;
    const match = batchAccountId.match(regex);
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
