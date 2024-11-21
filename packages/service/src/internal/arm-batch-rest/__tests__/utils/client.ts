import { BatchApiVersion } from "../../../../constants";

const ARM_API_BASE_URI = "https://management.azure.com";

function getUrlBasePath(subscriptionId: string) {
    return `${ARM_API_BASE_URI}/subscriptions/${subscriptionId}`;
}

export function getUrlBatchAccountPath(
    subscriptionId: string,
    resourceGroupName: string,
    batchAccount?: string
): string {
    const stringUrlBuilder = [];
    const basePath = getUrlBasePath(subscriptionId);
    stringUrlBuilder.push(basePath);
    stringUrlBuilder.push(
        `/resourceGroups/${resourceGroupName}/providers/Microsoft.Batch/batchAccounts`
    );

    if (batchAccount) {
        stringUrlBuilder.push(`/${batchAccount}`);
    }

    return stringUrlBuilder.join("");
}

export function getUrlPoolPath(
    subscriptionId: string,
    resourceGroupName: string,
    batchAccount: string,
    poolName?: string
): string {
    const stringUrlBuilder = [];
    const basePath = getUrlBatchAccountPath(
        subscriptionId,
        resourceGroupName,
        batchAccount
    );

    stringUrlBuilder.push(basePath);
    stringUrlBuilder.push("/pools");
    if (poolName) {
        stringUrlBuilder.push(`/${poolName}`);
    }

    stringUrlBuilder.push(`?api-version=${BatchApiVersion.arm}`);
    return stringUrlBuilder.join("");
}
