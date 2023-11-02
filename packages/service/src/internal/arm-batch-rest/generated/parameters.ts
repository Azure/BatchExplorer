// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { RawHttpHeadersInput } from "@azure/core-rest-pipeline";
import { RequestParameters } from "@azure-rest/core-client";
import {
  AccountBatchCreateParameters,
  AccountBatchUpdateParameters,
  AccountBatchRegenerateKeyParameters,
  ActivateApplicationPackageParameters,
  ApplicationPackage,
  Application,
  CheckNameAvailabilityParameters,
  CertificateCreateOrUpdateParameters,
  PrivateEndpointConnection,
  Pool
} from "./models";

export interface BatchAccountCreateBodyParam {
  /** Additional parameters for account creation. */
  body: AccountBatchCreateParameters;
}

export interface BatchAccountCreateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type BatchAccountCreateParameters = BatchAccountCreateMediaTypesParam &
  BatchAccountCreateBodyParam &
  RequestParameters;

export interface BatchAccountUpdateBodyParam {
  /** Additional parameters for account update. */
  body: AccountBatchUpdateParameters;
}

export interface BatchAccountUpdateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type BatchAccountUpdateParameters = BatchAccountUpdateMediaTypesParam &
  BatchAccountUpdateBodyParam &
  RequestParameters;
export type BatchAccountDeleteParameters = RequestParameters;
export type BatchAccountGetParameters = RequestParameters;
export type BatchAccountListParameters = RequestParameters;
export type BatchAccountListByResourceGroupParameters = RequestParameters;
export type BatchAccountSynchronizeAutoStorageKeysParameters = RequestParameters;

export interface BatchAccountRegenerateKeyBodyParam {
  /** The type of key to regenerate. */
  body: AccountBatchRegenerateKeyParameters;
}

export interface BatchAccountRegenerateKeyMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type BatchAccountRegenerateKeyParameters = BatchAccountRegenerateKeyMediaTypesParam &
  BatchAccountRegenerateKeyBodyParam &
  RequestParameters;
export type BatchAccountGetKeysParameters = RequestParameters;
export type BatchAccountListDetectorsParameters = RequestParameters;
export type BatchAccountGetDetectorParameters = RequestParameters;
export type BatchAccountListOutboundNetworkDependenciesEndpointsParameters = RequestParameters;

export interface ApplicationPackageActivateBodyParam {
  /** The parameters for the request. */
  body: ActivateApplicationPackageParameters;
}

export interface ApplicationPackageActivateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type ApplicationPackageActivateParameters = ApplicationPackageActivateMediaTypesParam &
  ApplicationPackageActivateBodyParam &
  RequestParameters;

export interface ApplicationPackageCreateBodyParam {
  /** The parameters for the request. */
  body?: ApplicationPackage;
}

export interface ApplicationPackageCreateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type ApplicationPackageCreateParameters = ApplicationPackageCreateMediaTypesParam &
  ApplicationPackageCreateBodyParam &
  RequestParameters;
export type ApplicationPackageDeleteParameters = RequestParameters;
export type ApplicationPackageGetParameters = RequestParameters;

export interface ApplicationPackageListQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
}

export interface ApplicationPackageListQueryParam {
  queryParameters?: ApplicationPackageListQueryParamProperties;
}

export type ApplicationPackageListParameters = ApplicationPackageListQueryParam &
  RequestParameters;

export interface ApplicationCreateBodyParam {
  /** The parameters for the request. */
  body?: Application;
}

export interface ApplicationCreateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type ApplicationCreateParameters = ApplicationCreateMediaTypesParam &
  ApplicationCreateBodyParam &
  RequestParameters;
export type ApplicationDeleteParameters = RequestParameters;
export type ApplicationGetParameters = RequestParameters;

export interface ApplicationUpdateBodyParam {
  /** The parameters for the request. */
  body: Application;
}

export interface ApplicationUpdateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type ApplicationUpdateParameters = ApplicationUpdateMediaTypesParam &
  ApplicationUpdateBodyParam &
  RequestParameters;

export interface ApplicationListQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
}

export interface ApplicationListQueryParam {
  queryParameters?: ApplicationListQueryParamProperties;
}

export type ApplicationListParameters = ApplicationListQueryParam &
  RequestParameters;
export type LocationGetQuotasParameters = RequestParameters;

export interface LocationListSupportedVirtualMachineSkusQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
  /** OData filter expression. Valid properties for filtering are "familyName". */
  $filter?: string;
}

export interface LocationListSupportedVirtualMachineSkusQueryParam {
  queryParameters?: LocationListSupportedVirtualMachineSkusQueryParamProperties;
}

export type LocationListSupportedVirtualMachineSkusParameters = LocationListSupportedVirtualMachineSkusQueryParam &
  RequestParameters;

export interface LocationListSupportedCloudServiceSkusQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
  /** OData filter expression. Valid properties for filtering are "familyName". */
  $filter?: string;
}

export interface LocationListSupportedCloudServiceSkusQueryParam {
  queryParameters?: LocationListSupportedCloudServiceSkusQueryParamProperties;
}

export type LocationListSupportedCloudServiceSkusParameters = LocationListSupportedCloudServiceSkusQueryParam &
  RequestParameters;

export interface LocationCheckNameAvailabilityBodyParam {
  /** Properties needed to check the availability of a name. */
  body: CheckNameAvailabilityParameters;
}

export interface LocationCheckNameAvailabilityMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type LocationCheckNameAvailabilityParameters = LocationCheckNameAvailabilityMediaTypesParam &
  LocationCheckNameAvailabilityBodyParam &
  RequestParameters;
export type OperationsListParameters = RequestParameters;

export interface CertificateListByBatchAccountQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
  /** Comma separated list of properties that should be returned. e.g. "properties/provisioningState". Only top level properties under properties/ are valid for selection. */
  $select?: string;
  /** OData filter expression. Valid properties for filtering are "properties/provisioningState", "properties/provisioningStateTransitionTime", "name". */
  $filter?: string;
}

export interface CertificateListByBatchAccountQueryParam {
  queryParameters?: CertificateListByBatchAccountQueryParamProperties;
}

export type CertificateListByBatchAccountParameters = CertificateListByBatchAccountQueryParam &
  RequestParameters;

export interface CertificateCreateHeaders {
  /** The entity state (ETag) version of the certificate to update. A value of "*" can be used to apply the operation only if the certificate already exists. If omitted, this operation will always be applied. */
  "If-Match"?: string;
  /** Set to '*' to allow a new certificate to be created, but to prevent updating an existing certificate. Other values will be ignored. */
  "If-None-Match"?: string;
}

export interface CertificateCreateBodyParam {
  /** Additional parameters for certificate creation. */
  body: CertificateCreateOrUpdateParameters;
}

export interface CertificateCreateHeaderParam {
  headers: RawHttpHeadersInput & CertificateCreateHeaders;
}

export interface CertificateCreateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type CertificateCreateParameters = CertificateCreateHeaderParam &
  CertificateCreateMediaTypesParam &
  CertificateCreateBodyParam &
  RequestParameters;

export interface CertificateUpdateHeaders {
  /** The entity state (ETag) version of the certificate to update. This value can be omitted or set to "*" to apply the operation unconditionally. */
  "If-Match"?: string;
}

export interface CertificateUpdateBodyParam {
  /** Certificate entity to update. */
  body: CertificateCreateOrUpdateParameters;
}

export interface CertificateUpdateHeaderParam {
  headers: RawHttpHeadersInput & CertificateUpdateHeaders;
}

export interface CertificateUpdateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type CertificateUpdateParameters = CertificateUpdateHeaderParam &
  CertificateUpdateMediaTypesParam &
  CertificateUpdateBodyParam &
  RequestParameters;
export type CertificateDeleteParameters = RequestParameters;
export type CertificateGetParameters = RequestParameters;
export type CertificateCancelDeletionParameters = RequestParameters;

export interface PrivateLinkResourceListByBatchAccountQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
}

export interface PrivateLinkResourceListByBatchAccountQueryParam {
  queryParameters?: PrivateLinkResourceListByBatchAccountQueryParamProperties;
}

export type PrivateLinkResourceListByBatchAccountParameters = PrivateLinkResourceListByBatchAccountQueryParam &
  RequestParameters;
export type PrivateLinkResourceGetParameters = RequestParameters;

export interface PrivateEndpointConnectionListByBatchAccountQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
}

export interface PrivateEndpointConnectionListByBatchAccountQueryParam {
  queryParameters?: PrivateEndpointConnectionListByBatchAccountQueryParamProperties;
}

export type PrivateEndpointConnectionListByBatchAccountParameters = PrivateEndpointConnectionListByBatchAccountQueryParam &
  RequestParameters;
export type PrivateEndpointConnectionGetParameters = RequestParameters;

export interface PrivateEndpointConnectionUpdateHeaders {
  /** The state (ETag) version of the private endpoint connection to update. This value can be omitted or set to "*" to apply the operation unconditionally. */
  "If-Match"?: string;
}

export interface PrivateEndpointConnectionUpdateBodyParam {
  /** PrivateEndpointConnection properties that should be updated. Properties that are supplied will be updated, any property not supplied will be unchanged. */
  body: PrivateEndpointConnection;
}

export interface PrivateEndpointConnectionUpdateHeaderParam {
  headers: RawHttpHeadersInput & PrivateEndpointConnectionUpdateHeaders;
}

export interface PrivateEndpointConnectionUpdateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type PrivateEndpointConnectionUpdateParameters = PrivateEndpointConnectionUpdateHeaderParam &
  PrivateEndpointConnectionUpdateMediaTypesParam &
  PrivateEndpointConnectionUpdateBodyParam &
  RequestParameters;
export type PrivateEndpointConnectionDeleteParameters = RequestParameters;

export interface PoolListByBatchAccountQueryParamProperties {
  /** The maximum number of items to return in the response. */
  maxresults?: number;
  /** Comma separated list of properties that should be returned. e.g. "properties/provisioningState". Only top level properties under properties/ are valid for selection. */
  $select?: string;
  /**
   * OData filter expression. Valid properties for filtering are:
   *
   *  name
   *  properties/allocationState
   *  properties/allocationStateTransitionTime
   *  properties/creationTime
   *  properties/provisioningState
   *  properties/provisioningStateTransitionTime
   *  properties/lastModified
   *  properties/vmSize
   *  properties/interNodeCommunication
   *  properties/scaleSettings/autoScale
   *  properties/scaleSettings/fixedScale
   */
  $filter?: string;
}

export interface PoolListByBatchAccountQueryParam {
  queryParameters?: PoolListByBatchAccountQueryParamProperties;
}

export type PoolListByBatchAccountParameters = PoolListByBatchAccountQueryParam &
  RequestParameters;

export interface PoolCreateHeaders {
  /** The entity state (ETag) version of the pool to update. A value of "*" can be used to apply the operation only if the pool already exists. If omitted, this operation will always be applied. */
  "If-Match"?: string;
  /** Set to '*' to allow a new pool to be created, but to prevent updating an existing pool. Other values will be ignored. */
  "If-None-Match"?: string;
}

export interface PoolCreateBodyParam {
  /** Additional parameters for pool creation. */
  body: Pool;
}

export interface PoolCreateHeaderParam {
  headers: RawHttpHeadersInput & PoolCreateHeaders;
}

export interface PoolCreateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type PoolCreateParameters = PoolCreateHeaderParam &
  PoolCreateMediaTypesParam &
  PoolCreateBodyParam &
  RequestParameters;

export interface PoolUpdateHeaders {
  /** The entity state (ETag) version of the pool to update. This value can be omitted or set to "*" to apply the operation unconditionally. */
  "If-Match"?: string;
}

export interface PoolUpdateBodyParam {
  /** Pool properties that should be updated. Properties that are supplied will be updated, any property not supplied will be unchanged. */
  body: Pool;
}

export interface PoolUpdateHeaderParam {
  headers: RawHttpHeadersInput & PoolUpdateHeaders;
}

export interface PoolUpdateMediaTypesParam {
  /** Request content type */
  contentType?: "application/json";
}

export type PoolUpdateParameters = PoolUpdateHeaderParam &
  PoolUpdateMediaTypesParam &
  PoolUpdateBodyParam &
  RequestParameters;
export type PoolDeleteParameters = RequestParameters;
export type PoolGetParameters = RequestParameters;
export type PoolDisableAutoScaleParameters = RequestParameters;
export type PoolStopResizeParameters = RequestParameters;
