// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  BatchAccountCreateParameters,
  BatchAccountUpdateParameters,
  BatchAccountDeleteParameters,
  BatchAccountGetParameters,
  BatchAccountListParameters,
  BatchAccountListByResourceGroupParameters,
  BatchAccountSynchronizeAutoStorageKeysParameters,
  BatchAccountRegenerateKeyParameters,
  BatchAccountGetKeysParameters,
  BatchAccountListDetectorsParameters,
  BatchAccountGetDetectorParameters,
  BatchAccountListOutboundNetworkDependenciesEndpointsParameters,
  ApplicationPackageActivateParameters,
  ApplicationPackageCreateParameters,
  ApplicationPackageDeleteParameters,
  ApplicationPackageGetParameters,
  ApplicationPackageListParameters,
  ApplicationCreateParameters,
  ApplicationDeleteParameters,
  ApplicationGetParameters,
  ApplicationUpdateParameters,
  ApplicationListParameters,
  LocationGetQuotasParameters,
  LocationListSupportedVirtualMachineSkusParameters,
  LocationListSupportedCloudServiceSkusParameters,
  LocationCheckNameAvailabilityParameters,
  OperationsListParameters,
  CertificateListByBatchAccountParameters,
  CertificateCreateParameters,
  CertificateUpdateParameters,
  CertificateDeleteParameters,
  CertificateGetParameters,
  CertificateCancelDeletionParameters,
  PrivateLinkResourceListByBatchAccountParameters,
  PrivateLinkResourceGetParameters,
  PrivateEndpointConnectionListByBatchAccountParameters,
  PrivateEndpointConnectionGetParameters,
  PrivateEndpointConnectionUpdateParameters,
  PrivateEndpointConnectionDeleteParameters,
  PoolListByBatchAccountParameters,
  PoolCreateParameters,
  PoolUpdateParameters,
  PoolDeleteParameters,
  PoolGetParameters,
  PoolDisableAutoScaleParameters,
  PoolStopResizeParameters
} from "./parameters";
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
  PoolStopResizeDefaultResponse
} from "./responses";
import { Client, StreamableMethod } from "@azure-rest/core-client";

export interface BatchAccountCreate {
  /** Creates a new Batch account with the specified parameters. Existing accounts cannot be updated with this API and should instead be updated with the Update Batch Account API. */
  put(
    options: BatchAccountCreateParameters
  ): StreamableMethod<
    | BatchAccountCreate200Response
    | BatchAccountCreate202Response
    | BatchAccountCreateDefaultResponse
  >;
  /** Updates the properties of an existing Batch account. */
  patch(
    options: BatchAccountUpdateParameters
  ): StreamableMethod<
    BatchAccountUpdate200Response | BatchAccountUpdateDefaultResponse
  >;
  /** Deletes the specified Batch account. */
  delete(
    options?: BatchAccountDeleteParameters
  ): StreamableMethod<
    | BatchAccountDelete200Response
    | BatchAccountDelete202Response
    | BatchAccountDelete204Response
    | BatchAccountDeleteDefaultResponse
  >;
  /** Gets information about the specified Batch account. */
  get(
    options?: BatchAccountGetParameters
  ): StreamableMethod<
    BatchAccountGet200Response | BatchAccountGetDefaultResponse
  >;
}

export interface BatchAccountList {
  /** Gets information about the Batch accounts associated with the subscription. */
  get(
    options?: BatchAccountListParameters
  ): StreamableMethod<
    BatchAccountList200Response | BatchAccountListDefaultResponse
  >;
}

export interface BatchAccountListByResourceGroup {
  /** Gets information about the Batch accounts associated with the specified resource group. */
  get(
    options?: BatchAccountListByResourceGroupParameters
  ): StreamableMethod<
    | BatchAccountListByResourceGroup200Response
    | BatchAccountListByResourceGroupDefaultResponse
  >;
}

export interface BatchAccountSynchronizeAutoStorageKeys {
  /** Synchronizes access keys for the auto-storage account configured for the specified Batch account, only if storage key authentication is being used. */
  post(
    options?: BatchAccountSynchronizeAutoStorageKeysParameters
  ): StreamableMethod<
    | BatchAccountSynchronizeAutoStorageKeys204Response
    | BatchAccountSynchronizeAutoStorageKeysDefaultResponse
  >;
}

export interface BatchAccountRegenerateKey {
  /** This operation applies only to Batch accounts with allowedAuthenticationModes containing 'SharedKey'. If the Batch account doesn't contain 'SharedKey' in its allowedAuthenticationMode, clients cannot use shared keys to authenticate, and must use another allowedAuthenticationModes instead. In this case, regenerating the keys will fail. */
  post(
    options: BatchAccountRegenerateKeyParameters
  ): StreamableMethod<
    | BatchAccountRegenerateKey200Response
    | BatchAccountRegenerateKeyDefaultResponse
  >;
}

export interface BatchAccountGetKeys {
  /** This operation applies only to Batch accounts with allowedAuthenticationModes containing 'SharedKey'. If the Batch account doesn't contain 'SharedKey' in its allowedAuthenticationMode, clients cannot use shared keys to authenticate, and must use another allowedAuthenticationModes instead. In this case, getting the keys will fail. */
  post(
    options?: BatchAccountGetKeysParameters
  ): StreamableMethod<
    BatchAccountGetKeys200Response | BatchAccountGetKeysDefaultResponse
  >;
}

export interface BatchAccountListDetectors {
  /** Gets information about the detectors available for a given Batch account. */
  get(
    options?: BatchAccountListDetectorsParameters
  ): StreamableMethod<
    | BatchAccountListDetectors200Response
    | BatchAccountListDetectorsDefaultResponse
  >;
}

export interface BatchAccountGetDetector {
  /** Gets information about the given detector for a given Batch account. */
  get(
    options?: BatchAccountGetDetectorParameters
  ): StreamableMethod<
    BatchAccountGetDetector200Response | BatchAccountGetDetectorDefaultResponse
  >;
}

export interface BatchAccountListOutboundNetworkDependenciesEndpoints {
  /** Lists the endpoints that a Batch Compute Node under this Batch Account may call as part of Batch service administration. If you are deploying a Pool inside of a virtual network that you specify, you must make sure your network allows outbound access to these endpoints. Failure to allow access to these endpoints may cause Batch to mark the affected nodes as unusable. For more information about creating a pool inside of a virtual network, see https://docs.microsoft.com/en-us/azure/batch/batch-virtual-network. */
  get(
    options?: BatchAccountListOutboundNetworkDependenciesEndpointsParameters
  ): StreamableMethod<
    | BatchAccountListOutboundNetworkDependenciesEndpoints200Response
    | BatchAccountListOutboundNetworkDependenciesEndpointsDefaultResponse
  >;
}

export interface ApplicationPackageActivate {
  /** Activates the specified application package. This should be done after the `ApplicationPackage` was created and uploaded. This needs to be done before an `ApplicationPackage` can be used on Pools or Tasks. */
  post(
    options: ApplicationPackageActivateParameters
  ): StreamableMethod<
    | ApplicationPackageActivate200Response
    | ApplicationPackageActivateDefaultResponse
  >;
}

export interface ApplicationPackageCreate {
  /** Creates an application package record. The record contains a storageUrl where the package should be uploaded to.  Once it is uploaded the `ApplicationPackage` needs to be activated using `ApplicationPackageActive` before it can be used. If the auto storage account was configured to use storage keys, the URL returned will contain a SAS. */
  put(
    options?: ApplicationPackageCreateParameters
  ): StreamableMethod<
    | ApplicationPackageCreate200Response
    | ApplicationPackageCreateDefaultResponse
  >;
  /** Deletes an application package record and its associated binary file. */
  delete(
    options?: ApplicationPackageDeleteParameters
  ): StreamableMethod<
    | ApplicationPackageDelete200Response
    | ApplicationPackageDelete204Response
    | ApplicationPackageDeleteDefaultResponse
  >;
  /** Gets information about the specified application package. */
  get(
    options?: ApplicationPackageGetParameters
  ): StreamableMethod<
    ApplicationPackageGet200Response | ApplicationPackageGetDefaultResponse
  >;
}

export interface ApplicationPackageList {
  /** Lists all of the application packages in the specified application. */
  get(
    options?: ApplicationPackageListParameters
  ): StreamableMethod<
    ApplicationPackageList200Response | ApplicationPackageListDefaultResponse
  >;
}

export interface ApplicationCreate {
  /** Adds an application to the specified Batch account. */
  put(
    options?: ApplicationCreateParameters
  ): StreamableMethod<
    ApplicationCreate200Response | ApplicationCreateDefaultResponse
  >;
  /** Deletes an application. */
  delete(
    options?: ApplicationDeleteParameters
  ): StreamableMethod<
    | ApplicationDelete200Response
    | ApplicationDelete204Response
    | ApplicationDeleteDefaultResponse
  >;
  /** Gets information about the specified application. */
  get(
    options?: ApplicationGetParameters
  ): StreamableMethod<
    ApplicationGet200Response | ApplicationGetDefaultResponse
  >;
  /** Updates settings for the specified application. */
  patch(
    options: ApplicationUpdateParameters
  ): StreamableMethod<
    ApplicationUpdate200Response | ApplicationUpdateDefaultResponse
  >;
}

export interface ApplicationList {
  /** Lists all of the applications in the specified account. */
  get(
    options?: ApplicationListParameters
  ): StreamableMethod<
    ApplicationList200Response | ApplicationListDefaultResponse
  >;
}

export interface LocationGetQuotas {
  /** Gets the Batch service quotas for the specified subscription at the given location. */
  get(
    options?: LocationGetQuotasParameters
  ): StreamableMethod<
    LocationGetQuotas200Response | LocationGetQuotasDefaultResponse
  >;
}

export interface LocationListSupportedVirtualMachineSkus {
  /** Gets the list of Batch supported Virtual Machine VM sizes available at the given location. */
  get(
    options?: LocationListSupportedVirtualMachineSkusParameters
  ): StreamableMethod<
    | LocationListSupportedVirtualMachineSkus200Response
    | LocationListSupportedVirtualMachineSkusDefaultResponse
  >;
}

export interface LocationListSupportedCloudServiceSkus {
  /** Gets the list of Batch supported Cloud Service VM sizes available at the given location. */
  get(
    options?: LocationListSupportedCloudServiceSkusParameters
  ): StreamableMethod<
    | LocationListSupportedCloudServiceSkus200Response
    | LocationListSupportedCloudServiceSkusDefaultResponse
  >;
}

export interface LocationCheckNameAvailability {
  /** Checks whether the Batch account name is available in the specified region. */
  post(
    options: LocationCheckNameAvailabilityParameters
  ): StreamableMethod<
    | LocationCheckNameAvailability200Response
    | LocationCheckNameAvailabilityDefaultResponse
  >;
}

export interface OperationsList {
  /** Lists available operations for the Microsoft.Batch provider */
  get(
    options?: OperationsListParameters
  ): StreamableMethod<
    OperationsList200Response | OperationsListDefaultResponse
  >;
}

export interface CertificateListByBatchAccount {
  /** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
  get(
    options?: CertificateListByBatchAccountParameters
  ): StreamableMethod<
    | CertificateListByBatchAccount200Response
    | CertificateListByBatchAccountDefaultResponse
  >;
}

export interface CertificateCreate {
  /** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
  put(
    options: CertificateCreateParameters
  ): StreamableMethod<
    CertificateCreate200Response | CertificateCreateDefaultResponse
  >;
  /** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
  patch(
    options: CertificateUpdateParameters
  ): StreamableMethod<
    CertificateUpdate200Response | CertificateUpdateDefaultResponse
  >;
  /** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
  delete(
    options?: CertificateDeleteParameters
  ): StreamableMethod<
    | CertificateDelete200Response
    | CertificateDelete202Response
    | CertificateDelete204Response
    | CertificateDeleteDefaultResponse
  >;
  /** Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
  get(
    options?: CertificateGetParameters
  ): StreamableMethod<
    CertificateGet200Response | CertificateGetDefaultResponse
  >;
}

export interface CertificateCancelDeletion {
  /**
   * If you try to delete a certificate that is being used by a pool or compute node, the status of the certificate changes to deleteFailed. If you decide that you want to continue using the certificate, you can use this operation to set the status of the certificate back to active. If you intend to delete the certificate, you do not need to run this operation after the deletion failed. You must make sure that the certificate is not being used by any resources, and then you can try again to delete the certificate.
   *
   * Warning: This operation is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead.
   */
  post(
    options?: CertificateCancelDeletionParameters
  ): StreamableMethod<
    | CertificateCancelDeletion200Response
    | CertificateCancelDeletionDefaultResponse
  >;
}

export interface PrivateLinkResourceListByBatchAccount {
  /** Lists all of the private link resources in the specified account. */
  get(
    options?: PrivateLinkResourceListByBatchAccountParameters
  ): StreamableMethod<
    | PrivateLinkResourceListByBatchAccount200Response
    | PrivateLinkResourceListByBatchAccountDefaultResponse
  >;
}

export interface PrivateLinkResourceGet {
  /** Gets information about the specified private link resource. */
  get(
    options?: PrivateLinkResourceGetParameters
  ): StreamableMethod<
    PrivateLinkResourceGet200Response | PrivateLinkResourceGetDefaultResponse
  >;
}

export interface PrivateEndpointConnectionListByBatchAccount {
  /** Lists all of the private endpoint connections in the specified account. */
  get(
    options?: PrivateEndpointConnectionListByBatchAccountParameters
  ): StreamableMethod<
    | PrivateEndpointConnectionListByBatchAccount200Response
    | PrivateEndpointConnectionListByBatchAccountDefaultResponse
  >;
}

export interface PrivateEndpointConnectionGet {
  /** Gets information about the specified private endpoint connection. */
  get(
    options?: PrivateEndpointConnectionGetParameters
  ): StreamableMethod<
    | PrivateEndpointConnectionGet200Response
    | PrivateEndpointConnectionGetDefaultResponse
  >;
  /** Updates the properties of an existing private endpoint connection. */
  patch(
    options: PrivateEndpointConnectionUpdateParameters
  ): StreamableMethod<
    | PrivateEndpointConnectionUpdate200Response
    | PrivateEndpointConnectionUpdate202Response
    | PrivateEndpointConnectionUpdateDefaultResponse
  >;
  /** Deletes the specified private endpoint connection. */
  delete(
    options?: PrivateEndpointConnectionDeleteParameters
  ): StreamableMethod<
    | PrivateEndpointConnectionDelete202Response
    | PrivateEndpointConnectionDelete204Response
    | PrivateEndpointConnectionDeleteDefaultResponse
  >;
}

export interface PoolListByBatchAccount {
  /** Lists all of the pools in the specified account. */
  get(
    options?: PoolListByBatchAccountParameters
  ): StreamableMethod<
    PoolListByBatchAccount200Response | PoolListByBatchAccountDefaultResponse
  >;
}

export interface PoolCreate {
  /** Creates a new pool inside the specified account. */
  put(
    options: PoolCreateParameters
  ): StreamableMethod<PoolCreate200Response | PoolCreateDefaultResponse>;
  /** Updates the properties of an existing pool. */
  patch(
    options: PoolUpdateParameters
  ): StreamableMethod<PoolUpdate200Response | PoolUpdateDefaultResponse>;
  /** Deletes the specified pool. */
  delete(
    options?: PoolDeleteParameters
  ): StreamableMethod<
    | PoolDelete200Response
    | PoolDelete202Response
    | PoolDelete204Response
    | PoolDeleteDefaultResponse
  >;
  /** Gets information about the specified pool. */
  get(
    options?: PoolGetParameters
  ): StreamableMethod<PoolGet200Response | PoolGetDefaultResponse>;
}

export interface PoolDisableAutoScale {
  /** Disables automatic scaling for a pool. */
  post(
    options?: PoolDisableAutoScaleParameters
  ): StreamableMethod<
    PoolDisableAutoScale200Response | PoolDisableAutoScaleDefaultResponse
  >;
}

export interface PoolStopResize {
  /** This does not restore the pool to its previous state before the resize operation: it only stops any further changes being made, and the pool maintains its current state. After stopping, the pool stabilizes at the number of nodes it was at when the stop operation was done. During the stop operation, the pool allocation state changes first to stopping and then to steady. A resize operation need not be an explicit resize pool request; this API can also be used to halt the initial sizing of the pool when it is created. */
  post(
    options?: PoolStopResizeParameters
  ): StreamableMethod<
    PoolStopResize200Response | PoolStopResizeDefaultResponse
  >;
}

export interface Routes {
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}' has methods for the following verbs: put, patch, delete, get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): BatchAccountCreate;
  /** Resource for '/subscriptions/\{subscriptionId\}/providers/Microsoft.Batch/batchAccounts' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/batchAccounts",
    subscriptionId: string
  ): BatchAccountList;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts",
    subscriptionId: string,
    resourceGroupName: string
  ): BatchAccountListByResourceGroup;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/syncAutoStorageKeys' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/syncAutoStorageKeys",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): BatchAccountSynchronizeAutoStorageKeys;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/regenerateKeys' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/regenerateKeys",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): BatchAccountRegenerateKey;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/listKeys' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/listKeys",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): BatchAccountGetKeys;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/detectors' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/detectors",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): BatchAccountListDetectors;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/detectors/\{detectorId\}' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/detectors/{detectorId}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    detectorId: string
  ): BatchAccountGetDetector;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/outboundNetworkDependenciesEndpoints' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/outboundNetworkDependenciesEndpoints",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): BatchAccountListOutboundNetworkDependenciesEndpoints;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/applications/\{applicationName\}/versions/\{versionName\}/activate' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions/{versionName}/activate",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    applicationName: string,
    versionName: string
  ): ApplicationPackageActivate;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/applications/\{applicationName\}/versions/\{versionName\}' has methods for the following verbs: put, delete, get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions/{versionName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    applicationName: string,
    versionName: string
  ): ApplicationPackageCreate;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/applications/\{applicationName\}/versions' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}/versions",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    applicationName: string
  ): ApplicationPackageList;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/applications/\{applicationName\}' has methods for the following verbs: put, delete, get, patch */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications/{applicationName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    applicationName: string
  ): ApplicationCreate;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/applications' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/applications",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): ApplicationList;
  /** Resource for '/subscriptions/\{subscriptionId\}/providers/Microsoft.Batch/locations/\{locationName\}/quotas' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/quotas",
    subscriptionId: string,
    locationName: string
  ): LocationGetQuotas;
  /** Resource for '/subscriptions/\{subscriptionId\}/providers/Microsoft.Batch/locations/\{locationName\}/virtualMachineSkus' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/virtualMachineSkus",
    subscriptionId: string,
    locationName: string
  ): LocationListSupportedVirtualMachineSkus;
  /** Resource for '/subscriptions/\{subscriptionId\}/providers/Microsoft.Batch/locations/\{locationName\}/cloudServiceSkus' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/cloudServiceSkus",
    subscriptionId: string,
    locationName: string
  ): LocationListSupportedCloudServiceSkus;
  /** Resource for '/subscriptions/\{subscriptionId\}/providers/Microsoft.Batch/locations/\{locationName\}/checkNameAvailability' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/locations/{locationName}/checkNameAvailability",
    subscriptionId: string,
    locationName: string
  ): LocationCheckNameAvailability;
  /** Resource for '/providers/Microsoft.Batch/operations' has methods for the following verbs: get */
  (path: "/providers/Microsoft.Batch/operations"): OperationsList;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/certificates' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): CertificateListByBatchAccount;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/certificates/\{certificateName\}' has methods for the following verbs: put, patch, delete, get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    certificateName: string
  ): CertificateCreate;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/certificates/\{certificateName\}/cancelDelete' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/certificates/{certificateName}/cancelDelete",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    certificateName: string
  ): CertificateCancelDeletion;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/privateLinkResources' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateLinkResources",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): PrivateLinkResourceListByBatchAccount;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/privateLinkResources/\{privateLinkResourceName\}' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateLinkResources/{privateLinkResourceName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    privateLinkResourceName: string
  ): PrivateLinkResourceGet;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/privateEndpointConnections' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateEndpointConnections",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): PrivateEndpointConnectionListByBatchAccount;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/privateEndpointConnections/\{privateEndpointConnectionName\}' has methods for the following verbs: get, patch, delete */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/privateEndpointConnections/{privateEndpointConnectionName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    privateEndpointConnectionName: string
  ): PrivateEndpointConnectionGet;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/pools' has methods for the following verbs: get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string
  ): PoolListByBatchAccount;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/pools/\{poolName\}' has methods for the following verbs: put, patch, delete, get */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    poolName: string
  ): PoolCreate;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/pools/\{poolName\}/disableAutoScale' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}/disableAutoScale",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    poolName: string
  ): PoolDisableAutoScale;
  /** Resource for '/subscriptions/\{subscriptionId\}/resourceGroups/\{resourceGroupName\}/providers/Microsoft.Batch/batchAccounts/\{accountName\}/pools/\{poolName\}/stopResize' has methods for the following verbs: post */
  (
    path: "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}/pools/{poolName}/stopResize",
    subscriptionId: string,
    resourceGroupName: string,
    accountName: string,
    poolName: string
  ): PoolStopResize;
}

export type BatchManagementClient = Client & {
  path: Routes;
};
