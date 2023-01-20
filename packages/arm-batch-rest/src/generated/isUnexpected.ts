// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
    BatchAccountCreate200Response,
    BatchAccountCreate202Response,
    BatchAccountCreateDefaultResponse,
    BatchAccountUpdate200Response,
    BatchAccountUpdateDefaultResponse,
    BatchAccountDelete200Response,
    BatchAccountDelete202Response,
    BatchAccountDelete204Response,
    BatchAccountDeleteDefaultResponse,
    BatchAccountGet200Response,
    BatchAccountGetDefaultResponse,
    BatchAccountList200Response,
    BatchAccountListDefaultResponse,
    BatchAccountListByResourceGroup200Response,
    BatchAccountListByResourceGroupDefaultResponse,
    BatchAccountSynchronizeAutoStorageKeys204Response,
    BatchAccountSynchronizeAutoStorageKeysDefaultResponse,
    BatchAccountRegenerateKey200Response,
    BatchAccountRegenerateKeyDefaultResponse,
    BatchAccountGetKeys200Response,
    BatchAccountGetKeysDefaultResponse,
    BatchAccountListDetectors200Response,
    BatchAccountListDetectorsDefaultResponse,
    BatchAccountGetDetector200Response,
    BatchAccountGetDetectorDefaultResponse,
    BatchAccountListOutboundNetworkDependenciesEndpoints200Response,
    BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse,
    ApplicationPackageActivate200Response,
    ApplicationPackageActivateDefaultResponse,
    ApplicationPackageCreate200Response,
    ApplicationPackageCreateDefaultResponse,
    ApplicationPackageDelete200Response,
    ApplicationPackageDelete204Response,
    ApplicationPackageDeleteDefaultResponse,
    ApplicationPackageGet200Response,
    ApplicationPackageGetDefaultResponse,
    ApplicationPackageList200Response,
    ApplicationPackageListDefaultResponse,
    ApplicationCreate200Response,
    ApplicationCreateDefaultResponse,
    ApplicationDelete200Response,
    ApplicationDelete204Response,
    ApplicationDeleteDefaultResponse,
    ApplicationGet200Response,
    ApplicationGetDefaultResponse,
    ApplicationUpdate200Response,
    ApplicationUpdateDefaultResponse,
    ApplicationList200Response,
    ApplicationListDefaultResponse,
    LocationGetQuotas200Response,
    LocationGetQuotasDefaultResponse,
    LocationListSupportedVirtualMachineSkus200Response,
    LocationListSupportedVirtualMachineSkusDefaultResponse,
    LocationListSupportedCloudServiceSkus200Response,
    LocationListSupportedCloudServiceSkusDefaultResponse,
    LocationCheckNameAvailability200Response,
    LocationCheckNameAvailabilityDefaultResponse,
    OperationsList200Response,
    OperationsListDefaultResponse,
    CertificateListByBatchAccount200Response,
    CertificateListByBatchAccountDefaultResponse,
    CertificateCreate200Response,
    CertificateCreateDefaultResponse,
    CertificateUpdate200Response,
    CertificateUpdateDefaultResponse,
    CertificateDelete200Response,
    CertificateDelete202Response,
    CertificateDelete204Response,
    CertificateDeleteDefaultResponse,
    CertificateGet200Response,
    CertificateGetDefaultResponse,
    CertificateCancelDeletion200Response,
    CertificateCancelDeletionDefaultResponse,
    PrivateLinkResourceListByBatchAccount200Response,
    PrivateLinkResourceListByBatchAccountDefaultResponse,
    PrivateLinkResourceGet200Response,
    PrivateLinkResourceGetDefaultResponse,
    PrivateEndpointConnectionListByBatchAccount200Response,
    PrivateEndpointConnectionListByBatchAccountDefaultResponse,
    PrivateEndpointConnectionGet200Response,
    PrivateEndpointConnectionGetDefaultResponse,
    PrivateEndpointConnectionUpdate200Response,
    PrivateEndpointConnectionUpdate202Response,
    PrivateEndpointConnectionUpdateDefaultResponse,
    PrivateEndpointConnectionDelete202Response,
    PrivateEndpointConnectionDelete204Response,
    PrivateEndpointConnectionDeleteDefaultResponse,
    PoolListByBatchAccount200Response,
    PoolListByBatchAccountDefaultResponse,
    PoolCreate200Response,
    PoolCreateDefaultResponse,
    PoolUpdate200Response,
    PoolUpdateDefaultResponse,
    PoolDelete200Response,
    PoolDelete202Response,
    PoolDelete204Response,
    PoolDeleteDefaultResponse,
    PoolGet200Response,
    PoolGetDefaultResponse,
    PoolDisableAutoScale200Response,
    PoolDisableAutoScaleDefaultResponse,
    PoolStopResize200Response,
    PoolStopResizeDefaultResponse,
} from "./responses";

const responseMap: Record<string, string[]> = {
    "PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}":
        ["200", "202"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}":
        ["200"],
    "PATCH /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}":
        ["200"],
    "DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}":
        ["200", "202", "204"],
    "GET /subscriptions/{subscriptionId}/providers/Microsoft.Batch/batchAccounts":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts":
        ["200"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/syncAutoStorageKeys":
        ["204"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/regenerateKeys":
        ["200"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/listKeys":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/detectors":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/detectors/{detectorId}":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/outboundNetworkDependenciesEndpoints":
        ["200"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions/{versionName}/activate":
        ["200"],
    "PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions/{versionName}":
        ["200"],
    "DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions/{versionName}":
        ["200", "204"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions/{versionName}":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions":
        ["200"],
    "PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}":
        ["200"],
    "DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}":
        ["200", "204"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}":
        ["200"],
    "PATCH /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications":
        ["200"],
    "GET /subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/quotas":
        ["200"],
    "GET /subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/virtualMachineSkus":
        ["200"],
    "GET /subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/cloudServiceSkus":
        ["200"],
    "POST /subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/checkNameAvailability":
        ["200"],
    "GET /providers/Microsoft.Batch/operations": ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates":
        ["200"],
    "PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}":
        ["200"],
    "PATCH /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}":
        ["200"],
    "DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}":
        ["200", "202", "204"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}":
        ["200"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}/cancelDelete":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateLinkResources":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateLinkResources/{privateLinkResourceName}":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateEndpointConnections":
        ["200"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateEndpointConnections/{privateEndpointConnectionName}":
        ["200"],
    "PATCH /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateEndpointConnections/{privateEndpointConnectionName}":
        ["200", "202"],
    "DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateEndpointConnections/{privateEndpointConnectionName}":
        ["202", "204"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools":
        ["200"],
    "PUT /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}":
        ["200"],
    "PATCH /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}":
        ["200"],
    "DELETE /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}":
        ["200", "202", "204"],
    "GET /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}":
        ["200"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}/disableAutoScale":
        ["200"],
    "POST /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}/stopResize":
        ["200"],
};

export function isUnexpected(
    response:
        | BatchAccountCreate200Response
        | BatchAccountCreate202Response
        | BatchAccountCreateDefaultResponse
): response is BatchAccountCreateDefaultResponse;
export function isUnexpected(
    response: BatchAccountUpdate200Response | BatchAccountUpdateDefaultResponse
): response is BatchAccountUpdateDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountDelete200Response
        | BatchAccountDelete202Response
        | BatchAccountDelete204Response
        | BatchAccountDeleteDefaultResponse
): response is BatchAccountDeleteDefaultResponse;
export function isUnexpected(
    response: BatchAccountGet200Response | BatchAccountGetDefaultResponse
): response is BatchAccountGetDefaultResponse;
export function isUnexpected(
    response: BatchAccountList200Response | BatchAccountListDefaultResponse
): response is BatchAccountListDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountListByResourceGroup200Response
        | BatchAccountListByResourceGroupDefaultResponse
): response is BatchAccountListByResourceGroupDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountSynchronizeAutoStorageKeys204Response
        | BatchAccountSynchronizeAutoStorageKeysDefaultResponse
): response is BatchAccountSynchronizeAutoStorageKeysDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountRegenerateKey200Response
        | BatchAccountRegenerateKeyDefaultResponse
): response is BatchAccountRegenerateKeyDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountGetKeys200Response
        | BatchAccountGetKeysDefaultResponse
): response is BatchAccountGetKeysDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountListDetectors200Response
        | BatchAccountListDetectorsDefaultResponse
): response is BatchAccountListDetectorsDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountGetDetector200Response
        | BatchAccountGetDetectorDefaultResponse
): response is BatchAccountGetDetectorDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountListOutboundNetworkDependenciesEndpoints200Response
        | BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse
): response is BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse;
export function isUnexpected(
    response:
        | ApplicationPackageActivate200Response
        | ApplicationPackageActivateDefaultResponse
): response is ApplicationPackageActivateDefaultResponse;
export function isUnexpected(
    response:
        | ApplicationPackageCreate200Response
        | ApplicationPackageCreateDefaultResponse
): response is ApplicationPackageCreateDefaultResponse;
export function isUnexpected(
    response:
        | ApplicationPackageDelete200Response
        | ApplicationPackageDelete204Response
        | ApplicationPackageDeleteDefaultResponse
): response is ApplicationPackageDeleteDefaultResponse;
export function isUnexpected(
    response:
        | ApplicationPackageGet200Response
        | ApplicationPackageGetDefaultResponse
): response is ApplicationPackageGetDefaultResponse;
export function isUnexpected(
    response:
        | ApplicationPackageList200Response
        | ApplicationPackageListDefaultResponse
): response is ApplicationPackageListDefaultResponse;
export function isUnexpected(
    response: ApplicationCreate200Response | ApplicationCreateDefaultResponse
): response is ApplicationCreateDefaultResponse;
export function isUnexpected(
    response:
        | ApplicationDelete200Response
        | ApplicationDelete204Response
        | ApplicationDeleteDefaultResponse
): response is ApplicationDeleteDefaultResponse;
export function isUnexpected(
    response: ApplicationGet200Response | ApplicationGetDefaultResponse
): response is ApplicationGetDefaultResponse;
export function isUnexpected(
    response: ApplicationUpdate200Response | ApplicationUpdateDefaultResponse
): response is ApplicationUpdateDefaultResponse;
export function isUnexpected(
    response: ApplicationList200Response | ApplicationListDefaultResponse
): response is ApplicationListDefaultResponse;
export function isUnexpected(
    response: LocationGetQuotas200Response | LocationGetQuotasDefaultResponse
): response is LocationGetQuotasDefaultResponse;
export function isUnexpected(
    response:
        | LocationListSupportedVirtualMachineSkus200Response
        | LocationListSupportedVirtualMachineSkusDefaultResponse
): response is LocationListSupportedVirtualMachineSkusDefaultResponse;
export function isUnexpected(
    response:
        | LocationListSupportedCloudServiceSkus200Response
        | LocationListSupportedCloudServiceSkusDefaultResponse
): response is LocationListSupportedCloudServiceSkusDefaultResponse;
export function isUnexpected(
    response:
        | LocationCheckNameAvailability200Response
        | LocationCheckNameAvailabilityDefaultResponse
): response is LocationCheckNameAvailabilityDefaultResponse;
export function isUnexpected(
    response: OperationsList200Response | OperationsListDefaultResponse
): response is OperationsListDefaultResponse;
export function isUnexpected(
    response:
        | CertificateListByBatchAccount200Response
        | CertificateListByBatchAccountDefaultResponse
): response is CertificateListByBatchAccountDefaultResponse;
export function isUnexpected(
    response: CertificateCreate200Response | CertificateCreateDefaultResponse
): response is CertificateCreateDefaultResponse;
export function isUnexpected(
    response: CertificateUpdate200Response | CertificateUpdateDefaultResponse
): response is CertificateUpdateDefaultResponse;
export function isUnexpected(
    response:
        | CertificateDelete200Response
        | CertificateDelete202Response
        | CertificateDelete204Response
        | CertificateDeleteDefaultResponse
): response is CertificateDeleteDefaultResponse;
export function isUnexpected(
    response: CertificateGet200Response | CertificateGetDefaultResponse
): response is CertificateGetDefaultResponse;
export function isUnexpected(
    response:
        | CertificateCancelDeletion200Response
        | CertificateCancelDeletionDefaultResponse
): response is CertificateCancelDeletionDefaultResponse;
export function isUnexpected(
    response:
        | PrivateLinkResourceListByBatchAccount200Response
        | PrivateLinkResourceListByBatchAccountDefaultResponse
): response is PrivateLinkResourceListByBatchAccountDefaultResponse;
export function isUnexpected(
    response:
        | PrivateLinkResourceGet200Response
        | PrivateLinkResourceGetDefaultResponse
): response is PrivateLinkResourceGetDefaultResponse;
export function isUnexpected(
    response:
        | PrivateEndpointConnectionListByBatchAccount200Response
        | PrivateEndpointConnectionListByBatchAccountDefaultResponse
): response is PrivateEndpointConnectionListByBatchAccountDefaultResponse;
export function isUnexpected(
    response:
        | PrivateEndpointConnectionGet200Response
        | PrivateEndpointConnectionGetDefaultResponse
): response is PrivateEndpointConnectionGetDefaultResponse;
export function isUnexpected(
    response:
        | PrivateEndpointConnectionUpdate200Response
        | PrivateEndpointConnectionUpdate202Response
        | PrivateEndpointConnectionUpdateDefaultResponse
): response is PrivateEndpointConnectionUpdateDefaultResponse;
export function isUnexpected(
    response:
        | PrivateEndpointConnectionDelete202Response
        | PrivateEndpointConnectionDelete204Response
        | PrivateEndpointConnectionDeleteDefaultResponse
): response is PrivateEndpointConnectionDeleteDefaultResponse;
export function isUnexpected(
    response:
        | PoolListByBatchAccount200Response
        | PoolListByBatchAccountDefaultResponse
): response is PoolListByBatchAccountDefaultResponse;
export function isUnexpected(
    response: PoolCreate200Response | PoolCreateDefaultResponse
): response is PoolCreateDefaultResponse;
export function isUnexpected(
    response: PoolUpdate200Response | PoolUpdateDefaultResponse
): response is PoolUpdateDefaultResponse;
export function isUnexpected(
    response:
        | PoolDelete200Response
        | PoolDelete202Response
        | PoolDelete204Response
        | PoolDeleteDefaultResponse
): response is PoolDeleteDefaultResponse;
export function isUnexpected(
    response: PoolGet200Response | PoolGetDefaultResponse
): response is PoolGetDefaultResponse;
export function isUnexpected(
    response:
        | PoolDisableAutoScale200Response
        | PoolDisableAutoScaleDefaultResponse
): response is PoolDisableAutoScaleDefaultResponse;
export function isUnexpected(
    response: PoolStopResize200Response | PoolStopResizeDefaultResponse
): response is PoolStopResizeDefaultResponse;
export function isUnexpected(
    response:
        | BatchAccountCreate200Response
        | BatchAccountCreate202Response
        | BatchAccountCreateDefaultResponse
        | BatchAccountUpdate200Response
        | BatchAccountUpdateDefaultResponse
        | BatchAccountDelete200Response
        | BatchAccountDelete202Response
        | BatchAccountDelete204Response
        | BatchAccountDeleteDefaultResponse
        | BatchAccountGet200Response
        | BatchAccountGetDefaultResponse
        | BatchAccountList200Response
        | BatchAccountListDefaultResponse
        | BatchAccountListByResourceGroup200Response
        | BatchAccountListByResourceGroupDefaultResponse
        | BatchAccountSynchronizeAutoStorageKeys204Response
        | BatchAccountSynchronizeAutoStorageKeysDefaultResponse
        | BatchAccountRegenerateKey200Response
        | BatchAccountRegenerateKeyDefaultResponse
        | BatchAccountGetKeys200Response
        | BatchAccountGetKeysDefaultResponse
        | BatchAccountListDetectors200Response
        | BatchAccountListDetectorsDefaultResponse
        | BatchAccountGetDetector200Response
        | BatchAccountGetDetectorDefaultResponse
        | BatchAccountListOutboundNetworkDependenciesEndpoints200Response
        | BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse
        | ApplicationPackageActivate200Response
        | ApplicationPackageActivateDefaultResponse
        | ApplicationPackageCreate200Response
        | ApplicationPackageCreateDefaultResponse
        | ApplicationPackageDelete200Response
        | ApplicationPackageDelete204Response
        | ApplicationPackageDeleteDefaultResponse
        | ApplicationPackageGet200Response
        | ApplicationPackageGetDefaultResponse
        | ApplicationPackageList200Response
        | ApplicationPackageListDefaultResponse
        | ApplicationCreate200Response
        | ApplicationCreateDefaultResponse
        | ApplicationDelete200Response
        | ApplicationDelete204Response
        | ApplicationDeleteDefaultResponse
        | ApplicationGet200Response
        | ApplicationGetDefaultResponse
        | ApplicationUpdate200Response
        | ApplicationUpdateDefaultResponse
        | ApplicationList200Response
        | ApplicationListDefaultResponse
        | LocationGetQuotas200Response
        | LocationGetQuotasDefaultResponse
        | LocationListSupportedVirtualMachineSkus200Response
        | LocationListSupportedVirtualMachineSkusDefaultResponse
        | LocationListSupportedCloudServiceSkus200Response
        | LocationListSupportedCloudServiceSkusDefaultResponse
        | LocationCheckNameAvailability200Response
        | LocationCheckNameAvailabilityDefaultResponse
        | OperationsList200Response
        | OperationsListDefaultResponse
        | CertificateListByBatchAccount200Response
        | CertificateListByBatchAccountDefaultResponse
        | CertificateCreate200Response
        | CertificateCreateDefaultResponse
        | CertificateUpdate200Response
        | CertificateUpdateDefaultResponse
        | CertificateDelete200Response
        | CertificateDelete202Response
        | CertificateDelete204Response
        | CertificateDeleteDefaultResponse
        | CertificateGet200Response
        | CertificateGetDefaultResponse
        | CertificateCancelDeletion200Response
        | CertificateCancelDeletionDefaultResponse
        | PrivateLinkResourceListByBatchAccount200Response
        | PrivateLinkResourceListByBatchAccountDefaultResponse
        | PrivateLinkResourceGet200Response
        | PrivateLinkResourceGetDefaultResponse
        | PrivateEndpointConnectionListByBatchAccount200Response
        | PrivateEndpointConnectionListByBatchAccountDefaultResponse
        | PrivateEndpointConnectionGet200Response
        | PrivateEndpointConnectionGetDefaultResponse
        | PrivateEndpointConnectionUpdate200Response
        | PrivateEndpointConnectionUpdate202Response
        | PrivateEndpointConnectionUpdateDefaultResponse
        | PrivateEndpointConnectionDelete202Response
        | PrivateEndpointConnectionDelete204Response
        | PrivateEndpointConnectionDeleteDefaultResponse
        | PoolListByBatchAccount200Response
        | PoolListByBatchAccountDefaultResponse
        | PoolCreate200Response
        | PoolCreateDefaultResponse
        | PoolUpdate200Response
        | PoolUpdateDefaultResponse
        | PoolDelete200Response
        | PoolDelete202Response
        | PoolDelete204Response
        | PoolDeleteDefaultResponse
        | PoolGet200Response
        | PoolGetDefaultResponse
        | PoolDisableAutoScale200Response
        | PoolDisableAutoScaleDefaultResponse
        | PoolStopResize200Response
        | PoolStopResizeDefaultResponse
): response is
    | BatchAccountCreateDefaultResponse
    | BatchAccountUpdateDefaultResponse
    | BatchAccountDeleteDefaultResponse
    | BatchAccountGetDefaultResponse
    | BatchAccountListDefaultResponse
    | BatchAccountListByResourceGroupDefaultResponse
    | BatchAccountSynchronizeAutoStorageKeysDefaultResponse
    | BatchAccountRegenerateKeyDefaultResponse
    | BatchAccountGetKeysDefaultResponse
    | BatchAccountListDetectorsDefaultResponse
    | BatchAccountGetDetectorDefaultResponse
    | BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse
    | ApplicationPackageActivateDefaultResponse
    | ApplicationPackageCreateDefaultResponse
    | ApplicationPackageDeleteDefaultResponse
    | ApplicationPackageGetDefaultResponse
    | ApplicationPackageListDefaultResponse
    | ApplicationCreateDefaultResponse
    | ApplicationDeleteDefaultResponse
    | ApplicationGetDefaultResponse
    | ApplicationUpdateDefaultResponse
    | ApplicationListDefaultResponse
    | LocationGetQuotasDefaultResponse
    | LocationListSupportedVirtualMachineSkusDefaultResponse
    | LocationListSupportedCloudServiceSkusDefaultResponse
    | LocationCheckNameAvailabilityDefaultResponse
    | OperationsListDefaultResponse
    | CertificateListByBatchAccountDefaultResponse
    | CertificateCreateDefaultResponse
    | CertificateUpdateDefaultResponse
    | CertificateDeleteDefaultResponse
    | CertificateGetDefaultResponse
    | CertificateCancelDeletionDefaultResponse
    | PrivateLinkResourceListByBatchAccountDefaultResponse
    | PrivateLinkResourceGetDefaultResponse
    | PrivateEndpointConnectionListByBatchAccountDefaultResponse
    | PrivateEndpointConnectionGetDefaultResponse
    | PrivateEndpointConnectionUpdateDefaultResponse
    | PrivateEndpointConnectionDeleteDefaultResponse
    | PoolListByBatchAccountDefaultResponse
    | PoolCreateDefaultResponse
    | PoolUpdateDefaultResponse
    | PoolDeleteDefaultResponse
    | PoolGetDefaultResponse
    | PoolDisableAutoScaleDefaultResponse
    | PoolStopResizeDefaultResponse {
    const lroOriginal = response.headers["x-ms-original-url"];
    const url = new URL(lroOriginal ?? response.request.url);
    const method = response.request.method;
    let pathDetails = responseMap[`${method} ${url.pathname}`];
    if (!pathDetails) {
        pathDetails = geParametrizedPathSuccess(method, url.pathname);
    }
    return !pathDetails.includes(response.status);
}

function geParametrizedPathSuccess(method: string, path: string): string[] {
    const pathParts = path.split("/");

    // Iterate the responseMap to find a match
    for (const [key, value] of Object.entries(responseMap)) {
        // Extracting the path from the map key which is in format
        // GET /path/foo
        if (!key.startsWith(method)) {
            continue;
        }
        const candidatePath = getPathFromMapKey(key);
        // Get each part of the url path
        const candidateParts = candidatePath.split("/");

        // If the candidate and actual paths don't match in size
        // we move on to the next candidate path
        if (
            candidateParts.length === pathParts.length &&
            hasParametrizedPath(key)
        ) {
            // track if we have found a match to return the values found.
            let found = true;
            for (let i = 0; i < candidateParts.length; i++) {
                if (
                    candidateParts[i]?.startsWith("{") &&
                    candidateParts[i]?.endsWith("}")
                ) {
                    // If the current part of the candidate is a "template" part
                    // it is a match with the actual path part on hand
                    // skip as the parameterized part can match anything
                    continue;
                }

                // If the candidate part is not a template and
                // the parts don't match mark the candidate as not found
                // to move on with the next candidate path.
                if (candidateParts[i] !== pathParts[i]) {
                    found = false;
                    break;
                }
            }

            // We finished evaluating the current candidate parts
            // if all parts matched we return the success values form
            // the path mapping.
            if (found) {
                return value;
            }
        }
    }

    // No match was found, return an empty array.
    return [];
}

function hasParametrizedPath(path: string): boolean {
    return path.includes("/{");
}

function getPathFromMapKey(mapKey: string): string {
    const pathStart = mapKey.indexOf("/");
    return mapKey.slice(pathStart);
}
