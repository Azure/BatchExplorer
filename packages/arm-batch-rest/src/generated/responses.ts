// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { RawHttpHeaders } from "@azure/core-rest-pipeline";
import { HttpResponse } from "@azure-rest/core-client";
import {
    BatchAccountOutput,
    CloudErrorOutput,
    BatchAccountListResultOutput,
    BatchAccountKeysOutput,
    DetectorListResultOutput,
    DetectorResponseOutput,
    OutboundEnvironmentEndpointCollectionOutput,
    ApplicationPackageOutput,
    ListApplicationPackagesResultOutput,
    ApplicationOutput,
    ListApplicationsResultOutput,
    BatchLocationQuotaOutput,
    SupportedSkusResultOutput,
    CheckNameAvailabilityResultOutput,
    OperationListResultOutput,
    ListCertificatesResultOutput,
    CertificateOutput,
    ListPrivateLinkResourcesResultOutput,
    PrivateLinkResourceOutput,
    ListPrivateEndpointConnectionsResultOutput,
    PrivateEndpointConnectionOutput,
    ListPoolsResultOutput,
    PoolOutput,
} from "./outputModels";

/** Creates a new Batch account with the specified parameters. Existing accounts cannot be updated with this API and should instead be updated with the Update Batch Account API. */
export interface BatchAccountCreate200Response extends HttpResponse {
    status: "200";
    body: BatchAccountOutput;
}

export interface BatchAccountCreate202Headers {
    /** The URL of the resource used to check the status of the asynchronous operation. */
    location?: string;
    /** Suggested delay to check the status of the asynchronous operation. The value is an integer that specifies the delay in seconds. */
    "retry-after"?: number;
}

/** Creates a new Batch account with the specified parameters. Existing accounts cannot be updated with this API and should instead be updated with the Update Batch Account API. */
export interface BatchAccountCreate202Response extends HttpResponse {
    status: "202";
    body: Record<string, unknown>;
    headers: RawHttpHeaders & BatchAccountCreate202Headers;
}

/** Creates a new Batch account with the specified parameters. Existing accounts cannot be updated with this API and should instead be updated with the Update Batch Account API. */
export interface BatchAccountCreateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Updates the properties of an existing Batch account. */
export interface BatchAccountUpdate200Response extends HttpResponse {
    status: "200";
    body: BatchAccountOutput;
}

/** Updates the properties of an existing Batch account. */
export interface BatchAccountUpdateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Deletes the specified Batch account. */
export interface BatchAccountDelete200Response extends HttpResponse {
    status: "200";
    body: Record<string, unknown>;
}

export interface BatchAccountDelete202Headers {
    /** The URL of the resource used to check the status of the asynchronous operation. */
    location?: string;
    /** Suggested delay to check the status of the asynchronous operation. The value is an integer that specifies the delay in seconds. */
    "retry-after"?: number;
}

/** Deletes the specified Batch account. */
export interface BatchAccountDelete202Response extends HttpResponse {
    status: "202";
    body: Record<string, unknown>;
    headers: RawHttpHeaders & BatchAccountDelete202Headers;
}

/** Deletes the specified Batch account. */
export interface BatchAccountDelete204Response extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Deletes the specified Batch account. */
export interface BatchAccountDeleteDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the specified Batch account. */
export interface BatchAccountGet200Response extends HttpResponse {
    status: "200";
    body: BatchAccountOutput;
}

/** Gets information about the specified Batch account. */
export interface BatchAccountGetDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the Batch accounts associated with the subscription. */
export interface BatchAccountList200Response extends HttpResponse {
    status: "200";
    body: BatchAccountListResultOutput;
}

/** Gets information about the Batch accounts associated with the subscription. */
export interface BatchAccountListDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the Batch accounts associated with the specified resource group. */
export interface BatchAccountListByResourceGroup200Response
    extends HttpResponse {
    status: "200";
    body: BatchAccountListResultOutput;
}

/** Gets information about the Batch accounts associated with the specified resource group. */
export interface BatchAccountListByResourceGroupDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Synchronizes access keys for the auto-storage account configured for the specified Batch account, only if storage key authentication is being used. */
export interface BatchAccountSynchronizeAutoStorageKeys204Response
    extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Synchronizes access keys for the auto-storage account configured for the specified Batch account, only if storage key authentication is being used. */
export interface BatchAccountSynchronizeAutoStorageKeysDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** This operation applies only to Batch accounts with allowedAuthenticationModes containing 'SharedKey'. If the Batch account doesn't contain 'SharedKey' in its allowedAuthenticationMode, clients cannot use shared keys to authenticate, and must use another allowedAuthenticationModes instead. In this case, regenerating the keys will fail. */
export interface BatchAccountRegenerateKey200Response extends HttpResponse {
    status: "200";
    body: BatchAccountKeysOutput;
}

/** This operation applies only to Batch accounts with allowedAuthenticationModes containing 'SharedKey'. If the Batch account doesn't contain 'SharedKey' in its allowedAuthenticationMode, clients cannot use shared keys to authenticate, and must use another allowedAuthenticationModes instead. In this case, regenerating the keys will fail. */
export interface BatchAccountRegenerateKeyDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** This operation applies only to Batch accounts with allowedAuthenticationModes containing 'SharedKey'. If the Batch account doesn't contain 'SharedKey' in its allowedAuthenticationMode, clients cannot use shared keys to authenticate, and must use another allowedAuthenticationModes instead. In this case, getting the keys will fail. */
export interface BatchAccountGetKeys200Response extends HttpResponse {
    status: "200";
    body: BatchAccountKeysOutput;
}

/** This operation applies only to Batch accounts with allowedAuthenticationModes containing 'SharedKey'. If the Batch account doesn't contain 'SharedKey' in its allowedAuthenticationMode, clients cannot use shared keys to authenticate, and must use another allowedAuthenticationModes instead. In this case, getting the keys will fail. */
export interface BatchAccountGetKeysDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the detectors available for a given Batch account. */
export interface BatchAccountListDetectors200Response extends HttpResponse {
    status: "200";
    body: DetectorListResultOutput;
}

/** Gets information about the detectors available for a given Batch account. */
export interface BatchAccountListDetectorsDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the given detector for a given Batch account. */
export interface BatchAccountGetDetector200Response extends HttpResponse {
    status: "200";
    body: DetectorResponseOutput;
}

/** Gets information about the given detector for a given Batch account. */
export interface BatchAccountGetDetectorDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists the endpoints that a Batch Compute Node under this Batch Account may call as part of Batch service administration. If you are deploying a Pool inside of a virtual network that you specify, you must make sure your network allows outbound access to these endpoints. Failure to allow access to these endpoints may cause Batch to mark the affected nodes as unusable. For more information about creating a pool inside of a virtual network, see https://docs.microsoft.com/en-us/azure/batch/batch-virtual-network. */
export interface BatchAccountListOutboundNetworkDependenciesEndpoints200Response
    extends HttpResponse {
    status: "200";
    body: OutboundEnvironmentEndpointCollectionOutput;
}

/** Lists the endpoints that a Batch Compute Node under this Batch Account may call as part of Batch service administration. If you are deploying a Pool inside of a virtual network that you specify, you must make sure your network allows outbound access to these endpoints. Failure to allow access to these endpoints may cause Batch to mark the affected nodes as unusable. For more information about creating a pool inside of a virtual network, see https://docs.microsoft.com/en-us/azure/batch/batch-virtual-network. */
export interface BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Activates the specified application package. This should be done after the `ApplicationPackage` was created and uploaded. This needs to be done before an `ApplicationPackage` can be used on Pools or Tasks. */
export interface ApplicationPackageActivate200Response extends HttpResponse {
    status: "200";
    body: ApplicationPackageOutput;
}

/** Activates the specified application package. This should be done after the `ApplicationPackage` was created and uploaded. This needs to be done before an `ApplicationPackage` can be used on Pools or Tasks. */
export interface ApplicationPackageActivateDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Creates an application package record. The record contains a storageUrl where the package should be uploaded to.  Once it is uploaded the `ApplicationPackage` needs to be activated using `ApplicationPackageActive` before it can be used. If the auto storage account was configured to use storage keys, the URL returned will contain a SAS. */
export interface ApplicationPackageCreate200Response extends HttpResponse {
    status: "200";
    body: ApplicationPackageOutput;
}

/** Creates an application package record. The record contains a storageUrl where the package should be uploaded to.  Once it is uploaded the `ApplicationPackage` needs to be activated using `ApplicationPackageActive` before it can be used. If the auto storage account was configured to use storage keys, the URL returned will contain a SAS. */
export interface ApplicationPackageCreateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Deletes an application package record and its associated binary file. */
export interface ApplicationPackageDelete200Response extends HttpResponse {
    status: "200";
    body: Record<string, unknown>;
}

/** Deletes an application package record and its associated binary file. */
export interface ApplicationPackageDelete204Response extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Deletes an application package record and its associated binary file. */
export interface ApplicationPackageDeleteDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the specified application package. */
export interface ApplicationPackageGet200Response extends HttpResponse {
    status: "200";
    body: ApplicationPackageOutput;
}

/** Gets information about the specified application package. */
export interface ApplicationPackageGetDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists all of the application packages in the specified application. */
export interface ApplicationPackageList200Response extends HttpResponse {
    status: "200";
    body: ListApplicationPackagesResultOutput;
}

/** Lists all of the application packages in the specified application. */
export interface ApplicationPackageListDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Adds an application to the specified Batch account. */
export interface ApplicationCreate200Response extends HttpResponse {
    status: "200";
    body: ApplicationOutput;
}

/** Adds an application to the specified Batch account. */
export interface ApplicationCreateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Deletes an application. */
export interface ApplicationDelete200Response extends HttpResponse {
    status: "200";
    body: Record<string, unknown>;
}

/** Deletes an application. */
export interface ApplicationDelete204Response extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Deletes an application. */
export interface ApplicationDeleteDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the specified application. */
export interface ApplicationGet200Response extends HttpResponse {
    status: "200";
    body: ApplicationOutput;
}

/** Gets information about the specified application. */
export interface ApplicationGetDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Updates settings for the specified application. */
export interface ApplicationUpdate200Response extends HttpResponse {
    status: "200";
    body: ApplicationOutput;
}

/** Updates settings for the specified application. */
export interface ApplicationUpdateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists all of the applications in the specified account. */
export interface ApplicationList200Response extends HttpResponse {
    status: "200";
    body: ListApplicationsResultOutput;
}

/** Lists all of the applications in the specified account. */
export interface ApplicationListDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets the Batch service quotas for the specified subscription at the given location. */
export interface LocationGetQuotas200Response extends HttpResponse {
    status: "200";
    body: BatchLocationQuotaOutput;
}

/** Gets the Batch service quotas for the specified subscription at the given location. */
export interface LocationGetQuotasDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets the list of Batch supported Virtual Machine VM sizes available at the given location. */
export interface LocationListSupportedVirtualMachineSkus200Response
    extends HttpResponse {
    status: "200";
    body: SupportedSkusResultOutput;
}

/** Gets the list of Batch supported Virtual Machine VM sizes available at the given location. */
export interface LocationListSupportedVirtualMachineSkusDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets the list of Batch supported Cloud Service VM sizes available at the given location. */
export interface LocationListSupportedCloudServiceSkus200Response
    extends HttpResponse {
    status: "200";
    body: SupportedSkusResultOutput;
}

/** Gets the list of Batch supported Cloud Service VM sizes available at the given location. */
export interface LocationListSupportedCloudServiceSkusDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Checks whether the Batch account name is available in the specified region. */
export interface LocationCheckNameAvailability200Response extends HttpResponse {
    status: "200";
    body: CheckNameAvailabilityResultOutput;
}

/** Checks whether the Batch account name is available in the specified region. */
export interface LocationCheckNameAvailabilityDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists available operations for the Microsoft.Batch provider */
export interface OperationsList200Response extends HttpResponse {
    status: "200";
    body: OperationListResultOutput;
}

/** Lists available operations for the Microsoft.Batch provider */
export interface OperationsListDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateListByBatchAccount200Response extends HttpResponse {
    status: "200";
    body: ListCertificatesResultOutput;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateListByBatchAccountDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface CertificateCreate200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateCreate200Response extends HttpResponse {
    status: "200";
    body: CertificateOutput;
    headers: RawHttpHeaders & CertificateCreate200Headers;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateCreateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface CertificateUpdate200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateUpdate200Response extends HttpResponse {
    status: "200";
    body: CertificateOutput;
    headers: RawHttpHeaders & CertificateUpdate200Headers;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateUpdateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateDelete200Response extends HttpResponse {
    status: "200";
    body: Record<string, unknown>;
}

export interface CertificateDelete202Headers {
    /** The URL of the resource used to check the status of the asynchronous operation. */
    location?: string;
    /** Suggested delay to check the status of the asynchronous operation. The value is an integer that represents the seconds. */
    "retry-after"?: number;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateDelete202Response extends HttpResponse {
    status: "202";
    body: Record<string, unknown>;
    headers: RawHttpHeaders & CertificateDelete202Headers;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateDelete204Response extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateDeleteDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface CertificateGet200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateGet200Response extends HttpResponse {
    status: "200";
    body: CertificateOutput;
    headers: RawHttpHeaders & CertificateGet200Headers;
}

/** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateGetDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface CertificateCancelDeletion200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/**
 * If you try to delete a certificate that is being used by a pool or compute node, the status of the certificate changes to deleteFailed. If you decide that you want to continue using the certificate, you can use this operation to set the status of the certificate back to active. If you intend to delete the certificate, you do not need to run this operation after the deletion failed. You must make sure that the certificate is not being used by any resources, and then you can try again to delete the certificate.
 *
 * Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead.
 */
export interface CertificateCancelDeletion200Response extends HttpResponse {
    status: "200";
    body: CertificateOutput;
    headers: RawHttpHeaders & CertificateCancelDeletion200Headers;
}

/**
 * If you try to delete a certificate that is being used by a pool or compute node, the status of the certificate changes to deleteFailed. If you decide that you want to continue using the certificate, you can use this operation to set the status of the certificate back to active. If you intend to delete the certificate, you do not need to run this operation after the deletion failed. You must make sure that the certificate is not being used by any resources, and then you can try again to delete the certificate.
 *
 * Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead.
 */
export interface CertificateCancelDeletionDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists all of the private link resources in the specified account. */
export interface PrivateLinkResourceListByBatchAccount200Response
    extends HttpResponse {
    status: "200";
    body: ListPrivateLinkResourcesResultOutput;
}

/** Lists all of the private link resources in the specified account. */
export interface PrivateLinkResourceListByBatchAccountDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the specified private link resource. */
export interface PrivateLinkResourceGet200Response extends HttpResponse {
    status: "200";
    body: PrivateLinkResourceOutput;
}

/** Gets information about the specified private link resource. */
export interface PrivateLinkResourceGetDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists all of the private endpoint connections in the specified account. */
export interface PrivateEndpointConnectionListByBatchAccount200Response
    extends HttpResponse {
    status: "200";
    body: ListPrivateEndpointConnectionsResultOutput;
}

/** Lists all of the private endpoint connections in the specified account. */
export interface PrivateEndpointConnectionListByBatchAccountDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Gets information about the specified private endpoint connection. */
export interface PrivateEndpointConnectionGet200Response extends HttpResponse {
    status: "200";
    body: PrivateEndpointConnectionOutput;
}

/** Gets information about the specified private endpoint connection. */
export interface PrivateEndpointConnectionGetDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Updates the properties of an existing private endpoint connection. */
export interface PrivateEndpointConnectionUpdate200Response
    extends HttpResponse {
    status: "200";
    body: PrivateEndpointConnectionOutput;
}

export interface PrivateEndpointConnectionUpdate202Headers {
    /** The URL of the resource used to check the status of the asynchronous operation. */
    location?: string;
    /** Suggested delay to check the status of the asynchronous operation. The value is an integer that represents the seconds. */
    "retry-after"?: number;
}

/** Updates the properties of an existing private endpoint connection. */
export interface PrivateEndpointConnectionUpdate202Response
    extends HttpResponse {
    status: "202";
    body: Record<string, unknown>;
    headers: RawHttpHeaders & PrivateEndpointConnectionUpdate202Headers;
}

/** Updates the properties of an existing private endpoint connection. */
export interface PrivateEndpointConnectionUpdateDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface PrivateEndpointConnectionDelete202Headers {
    /** The URL of the resource used to check the status of the asynchronous operation. */
    location?: string;
    /** Suggested delay to check the status of the asynchronous operation. The value is an integer that specifies the delay in seconds. */
    "retry-after"?: number;
}

/** Deletes the specified private endpoint connection. */
export interface PrivateEndpointConnectionDelete202Response
    extends HttpResponse {
    status: "202";
    body: Record<string, unknown>;
    headers: RawHttpHeaders & PrivateEndpointConnectionDelete202Headers;
}

/** Deletes the specified private endpoint connection. */
export interface PrivateEndpointConnectionDelete204Response
    extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Deletes the specified private endpoint connection. */
export interface PrivateEndpointConnectionDeleteDefaultResponse
    extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Lists all of the pools in the specified account. */
export interface PoolListByBatchAccount200Response extends HttpResponse {
    status: "200";
    body: ListPoolsResultOutput;
}

/** Lists all of the pools in the specified account. */
export interface PoolListByBatchAccountDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface PoolCreate200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Creates a new pool inside the specified account. */
export interface PoolCreate200Response extends HttpResponse {
    status: "200";
    body: PoolOutput;
    headers: RawHttpHeaders & PoolCreate200Headers;
}

/** Creates a new pool inside the specified account. */
export interface PoolCreateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface PoolUpdate200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Updates the properties of an existing pool. */
export interface PoolUpdate200Response extends HttpResponse {
    status: "200";
    body: PoolOutput;
    headers: RawHttpHeaders & PoolUpdate200Headers;
}

/** Updates the properties of an existing pool. */
export interface PoolUpdateDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

/** Deletes the specified pool. */
export interface PoolDelete200Response extends HttpResponse {
    status: "200";
    body: Record<string, unknown>;
}

export interface PoolDelete202Headers {
    /** The URL of the resource used to check the status of the asynchronous operation. */
    location?: string;
    /** Suggested delay to check the status of the asynchronous operation. The value is an integer that represents the seconds. */
    "retry-after"?: number;
}

/** Deletes the specified pool. */
export interface PoolDelete202Response extends HttpResponse {
    status: "202";
    body: Record<string, unknown>;
    headers: RawHttpHeaders & PoolDelete202Headers;
}

/** Deletes the specified pool. */
export interface PoolDelete204Response extends HttpResponse {
    status: "204";
    body: Record<string, unknown>;
}

/** Deletes the specified pool. */
export interface PoolDeleteDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface PoolGet200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Gets information about the specified pool. */
export interface PoolGet200Response extends HttpResponse {
    status: "200";
    body: PoolOutput;
    headers: RawHttpHeaders & PoolGet200Headers;
}

/** Gets information about the specified pool. */
export interface PoolGetDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface PoolDisableAutoScale200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** Disables automatic scaling for a pool. */
export interface PoolDisableAutoScale200Response extends HttpResponse {
    status: "200";
    body: PoolOutput;
    headers: RawHttpHeaders & PoolDisableAutoScale200Headers;
}

/** Disables automatic scaling for a pool. */
export interface PoolDisableAutoScaleDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}

export interface PoolStopResize200Headers {
    /** The ETag HTTP response header. This is an opaque string. You can use it to detect whether the resource has changed between requests. In particular, you can pass the ETag to one of the If-Match or If-None-Match headers. */
    etag?: string;
}

/** This does not restore the pool to its previous state before the resize operation: it only stops any further changes being made, and the pool maintains its current state. After stopping, the pool stabilizes at the number of nodes it was at when the stop operation was done. During the stop operation, the pool allocation state changes first to stopping and then to steady. A resize operation need not be an explicit resize pool request; this API can also be used to halt the initial sizing of the pool when it is created. */
export interface PoolStopResize200Response extends HttpResponse {
    status: "200";
    body: PoolOutput;
    headers: RawHttpHeaders & PoolStopResize200Headers;
}

/** This does not restore the pool to its previous state before the resize operation: it only stops any further changes being made, and the pool maintains its current state. After stopping, the pool stabilizes at the number of nodes it was at when the stop operation was done. During the stop operation, the pool allocation state changes first to stopping and then to steady. A resize operation need not be an explicit resize pool request; this API can also be used to halt the initial sizing of the pool when it is created. */
export interface PoolStopResizeDefaultResponse extends HttpResponse {
    status: string;
    body: CloudErrorOutput;
}
