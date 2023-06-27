// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/** The properties related to the auto-storage account. */
export interface AutoStorageBasePropertiesOutput {
  /** The resource ID of the storage account to be used for auto-storage account. */
  storageAccountId: string;
  /** The authentication mode which the Batch service will use to manage the auto-storage account. */
  authenticationMode?: "StorageKeys" | "BatchAccountManagedIdentity";
  /** The identity referenced here must be assigned to pools which have compute nodes that need access to auto-storage. */
  nodeIdentityReference?: ComputeNodeIdentityReferenceOutput;
}

/** The reference to a user assigned identity associated with the Batch pool which a compute node will use. */
export interface ComputeNodeIdentityReferenceOutput {
  /** The ARM resource id of the user assigned identity. */
  resourceId?: string;
}

/** Identifies the Azure key vault associated with a Batch account. */
export interface KeyVaultReferenceOutput {
  /** The resource ID of the Azure key vault associated with the Batch account. */
  id: string;
  /** The URL of the Azure key vault associated with the Batch account. */
  url: string;
}

/** Network profile for Batch account, which contains network rule settings for each endpoint. */
export interface NetworkProfileOutput {
  /** Network access profile for batchAccount endpoint (Batch account data plane API). */
  accountAccess?: EndpointAccessProfileOutput;
  /** Network access profile for nodeManagement endpoint (Batch service managing compute nodes for Batch pools). */
  nodeManagementAccess?: EndpointAccessProfileOutput;
}

/** Network access profile for Batch endpoint. */
export interface EndpointAccessProfileOutput {
  /** Default action for endpoint access. It is only applicable when publicNetworkAccess is enabled. */
  defaultAction: "Allow" | "Deny";
  /** Array of IP ranges to filter client IP address. */
  ipRules?: Array<IPRuleOutput>;
}

/** Rule to filter client IP address. */
export interface IPRuleOutput {
  /** Action when client IP address is matched. */
  action: "Allow";
  /** IPv4 address, or IPv4 address range in CIDR format. */
  value: string;
}

/** Configures how customer data is encrypted inside the Batch account. By default, accounts are encrypted using a Microsoft managed key. For additional control, a customer-managed key can be used instead. */
export interface EncryptionPropertiesOutput {
  /** Type of the key source. */
  keySource?: "Microsoft.Batch" | "Microsoft.KeyVault";
  /** Additional details when using Microsoft.KeyVault */
  keyVaultProperties?: KeyVaultPropertiesOutput;
}

/** KeyVault configuration when using an encryption KeySource of Microsoft.KeyVault. */
export interface KeyVaultPropertiesOutput {
  /**
   * Full path to the secret with or without version. Example https://mykeyvault.vault.azure.net/keys/testkey/6e34a81fef704045975661e297a4c053. or https://mykeyvault.vault.azure.net/keys/testkey. To be usable the following prerequisites must be met:
   *
   *  The Batch Account has a System Assigned identity
   *  The account identity has been granted Key/Get, Key/Unwrap and Key/Wrap permissions
   *  The KeyVault has soft-delete and purge protection enabled
   */
  keyIdentifier?: string;
}

/** The identity of the Batch account, if configured. This is used when the user specifies 'Microsoft.KeyVault' as their Batch account encryption configuration or when `ManagedIdentity` is selected as the auto-storage authentication mode. */
export interface BatchAccountIdentityOutput {
  /** The principal id of the Batch account. This property will only be provided for a system assigned identity. */
  principalId?: string;
  /** The tenant id associated with the Batch account. This property will only be provided for a system assigned identity. */
  tenantId?: string;
  /** The type of identity used for the Batch account. */
  type: "SystemAssigned" | "UserAssigned" | "None";
  /** The list of user identities associated with the Batch account. */
  userAssignedIdentities?: Record<string, UserAssignedIdentitiesOutput>;
}

/** The list of associated user identities. */
export interface UserAssignedIdentitiesOutput {
  /** The principal id of user assigned identity. */
  principalId?: string;
  /** The client id of user assigned identity. */
  clientId?: string;
}

/** Contains information about an Azure Batch account. */
export interface BatchAccountOutput extends ResourceOutput {
  /** The properties associated with the account. */
  properties?: BatchAccountPropertiesOutput;
  /** The identity of the Batch account. */
  identity?: BatchAccountIdentityOutput;
}

/** Account specific properties. */
export interface BatchAccountPropertiesOutput {
  /** The account endpoint used to interact with the Batch service. */
  accountEndpoint?: string;
  /** The endpoint used by compute node to connect to the Batch node management service. */
  nodeManagementEndpoint?: string;
  /** The provisioned state of the resource */
  provisioningState?:
    | "Invalid"
    | "Creating"
    | "Deleting"
    | "Succeeded"
    | "Failed"
    | "Cancelled";
  /** The allocation mode for creating pools in the Batch account. */
  poolAllocationMode?: "BatchService" | "UserSubscription";
  /** Identifies the Azure key vault associated with a Batch account. */
  keyVaultReference?: KeyVaultReferenceOutput;
  /** If not specified, the default value is 'enabled'. */
  publicNetworkAccess?: "Enabled" | "Disabled";
  /** The network profile only takes effect when publicNetworkAccess is enabled. */
  networkProfile?: NetworkProfileOutput;
  /** List of private endpoint connections associated with the Batch account */
  privateEndpointConnections?: Array<PrivateEndpointConnectionOutput>;
  /** Contains information about the auto-storage account associated with a Batch account. */
  autoStorage?: AutoStoragePropertiesOutput;
  /** Configures how customer data is encrypted inside the Batch account. By default, accounts are encrypted using a Microsoft managed key. For additional control, a customer-managed key can be used instead. */
  encryption?: EncryptionPropertiesOutput;
  /** For accounts with PoolAllocationMode set to UserSubscription, quota is managed on the subscription so this value is not returned. */
  dedicatedCoreQuota?: number;
  /** For accounts with PoolAllocationMode set to UserSubscription, quota is managed on the subscription so this value is not returned. */
  lowPriorityCoreQuota?: number;
  /** A list of the dedicated core quota per Virtual Machine family for the Batch account. For accounts with PoolAllocationMode set to UserSubscription, quota is managed on the subscription so this value is not returned. */
  dedicatedCoreQuotaPerVMFamily?: Array<VirtualMachineFamilyCoreQuotaOutput>;
  /** If this flag is true, dedicated core quota is enforced via both the dedicatedCoreQuotaPerVMFamily and dedicatedCoreQuota properties on the account. If this flag is false, dedicated core quota is enforced only via the dedicatedCoreQuota property on the account and does not consider Virtual Machine family. */
  dedicatedCoreQuotaPerVMFamilyEnforced?: boolean;
  /** The pool quota for the Batch account. */
  poolQuota?: number;
  /** The active job and job schedule quota for the Batch account. */
  activeJobAndJobScheduleQuota?: number;
  /** List of allowed authentication modes for the Batch account that can be used to authenticate with the data plane. This does not affect authentication with the control plane. */
  allowedAuthenticationModes?: Array<
    "SharedKey" | "AAD" | "TaskAuthenticationToken"
  >;
}

/** Contains information about a private link resource. */
export interface PrivateEndpointConnectionOutput extends ProxyResourceOutput {
  /** The properties associated with the private endpoint connection. */
  properties?: PrivateEndpointConnectionPropertiesOutput;
}

/** Private endpoint connection properties. */
export interface PrivateEndpointConnectionPropertiesOutput {
  /** The provisioning state of the private endpoint connection. */
  provisioningState?:
    | "Creating"
    | "Updating"
    | "Deleting"
    | "Succeeded"
    | "Failed"
    | "Cancelled";
  /** The private endpoint of the private endpoint connection. */
  privateEndpoint?: PrivateEndpointOutput;
  /** The value has one and only one group id. */
  groupIds?: Array<string>;
  /** The private link service connection state of the private endpoint connection */
  privateLinkServiceConnectionState?: PrivateLinkServiceConnectionStateOutput;
}

/** The private endpoint of the private endpoint connection. */
export interface PrivateEndpointOutput {
  /** The ARM resource identifier of the private endpoint. This is of the form /subscriptions/{subscription}/resourceGroups/{group}/providers/Microsoft.Network/privateEndpoints/{privateEndpoint}. */
  id?: string;
}

/** The private link service connection state of the private endpoint connection */
export interface PrivateLinkServiceConnectionStateOutput {
  /** The status of the Batch private endpoint connection */
  status: "Approved" | "Pending" | "Rejected" | "Disconnected";
  /** Description of the private Connection state */
  description?: string;
  /** Action required on the private connection state */
  actionsRequired?: string;
}

/** A definition of an Azure resource. */
export interface ProxyResourceOutput {
  /** The ID of the resource. */
  id?: string;
  /** The name of the resource. */
  name?: string;
  /** The type of the resource. */
  type?: string;
  /** The ETag of the resource, used for concurrency statements. */
  etag?: string;
}

/** Contains information about the auto-storage account associated with a Batch account. */
export interface AutoStoragePropertiesOutput
  extends AutoStorageBasePropertiesOutput {
  /** The UTC time at which storage keys were last synchronized with the Batch account. */
  lastKeySync: string;
}

/** A VM Family and its associated core quota for the Batch account. */
export interface VirtualMachineFamilyCoreQuotaOutput {
  /** The Virtual Machine family name. */
  name?: string;
  /** The core quota for the VM family for the Batch account. */
  coreQuota?: number;
}

/** A definition of an Azure resource. */
export interface ResourceOutput {
  /** The ID of the resource. */
  id?: string;
  /** The name of the resource. */
  name?: string;
  /** The type of the resource. */
  type?: string;
  /** The location of the resource. */
  location?: string;
  /** The tags of the resource. */
  tags?: Record<string, string>;
}

/** An error response from the Batch service. */
export interface CloudErrorOutput {
  /** The body of the error response. */
  error?: CloudErrorBodyOutput;
}

/** An error response from the Batch service. */
export interface CloudErrorBodyOutput {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code?: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message?: string;
  /** The target of the particular error. For example, the name of the property in error. */
  target?: string;
  /** A list of additional details about the error. */
  details?: Array<CloudErrorBodyOutput>;
}

/** Values returned by the List operation. */
export interface BatchAccountListResultOutput {
  /** The collection of Batch accounts returned by the listing operation. */
  value?: Array<BatchAccountOutput>;
  /** The continuation token. */
  nextLink?: string;
}

/** A set of Azure Batch account keys. */
export interface BatchAccountKeysOutput {
  /** The Batch account name. */
  accountName?: string;
  /** The primary key associated with the account. */
  primary?: string;
  /** The secondary key associated with the account. */
  secondary?: string;
}

/** An application package which represents a particular version of an application. */
export interface ApplicationPackageOutput extends ProxyResourceOutput {
  /** The properties associated with the Application Package. */
  properties?: ApplicationPackagePropertiesOutput;
}

/** Properties of an application package */
export interface ApplicationPackagePropertiesOutput {
  /** The current state of the application package. */
  state?: "Pending" | "Active";
  /** The format of the application package, if the package is active. */
  format?: string;
  /** The URL for the application package in Azure Storage. */
  storageUrl?: string;
  /** The UTC time at which the Azure Storage URL will expire. */
  storageUrlExpiry?: string;
  /** The time at which the package was last activated, if the package is active. */
  lastActivationTime?: string;
}

/** Contains information about an application in a Batch account. */
export interface ApplicationOutput extends ProxyResourceOutput {
  /** The properties associated with the Application. */
  properties?: ApplicationPropertiesOutput;
}

/** The properties associated with the Application. */
export interface ApplicationPropertiesOutput {
  /** The display name for the application. */
  displayName?: string;
  /** A value indicating whether packages within the application may be overwritten using the same version string. */
  allowUpdates?: boolean;
  /** The package to use if a client requests the application but does not specify a version. This property can only be set to the name of an existing package. */
  defaultVersion?: string;
}

/** The result of performing list applications. */
export interface ListApplicationsResultOutput {
  /** The list of applications. */
  value?: Array<ApplicationOutput>;
  /** The URL to get the next set of results. */
  nextLink?: string;
}

/** The result of performing list application packages. */
export interface ListApplicationPackagesResultOutput {
  /** The list of application packages. */
  value?: Array<ApplicationPackageOutput>;
  /** The URL to get the next set of results. */
  nextLink?: string;
}

/** Quotas associated with a Batch region for a particular subscription. */
export interface BatchLocationQuotaOutput {
  /** The number of Batch accounts that may be created under the subscription in the specified region. */
  accountQuota?: number;
}

/** The Batch List supported SKUs operation response. */
export interface SupportedSkusResultOutput {
  /** The list of SKUs available for the Batch service in the location. */
  value: Array<SupportedSkuOutput>;
  /** The URL to use for getting the next set of results. */
  nextLink?: string;
}

/** Describes a Batch supported SKU. */
export interface SupportedSkuOutput {
  /** The name of the SKU. */
  name?: string;
  /** The family name of the SKU. */
  familyName?: string;
  /** A collection of capabilities which this SKU supports. */
  capabilities?: Array<SkuCapabilityOutput>;
}

/** A SKU capability, such as the number of cores. */
export interface SkuCapabilityOutput {
  /** The name of the feature. */
  name?: string;
  /** The value of the feature. */
  value?: string;
}

/** Result of the request to list REST API operations. It contains a list of operations and a URL nextLink to get the next set of results. */
export interface OperationListResultOutput {
  /** The list of operations supported by the resource provider. */
  value?: Array<OperationOutput>;
  /** The URL to get the next set of operation list results if there are any. */
  nextLink?: string;
}

/** A REST API operation */
export interface OperationOutput {
  /** This is of the format {provider}/{resource}/{operation} */
  name?: string;
  /** Indicates whether the operation is a data action */
  isDataAction?: boolean;
  /** The object that describes the operation. */
  display?: OperationDisplayOutput;
  /** The intended executor of the operation. */
  origin?: string;
  /** Properties of the operation. */
  properties?: Record<string, unknown>;
}

/** The object that describes the operation. */
export interface OperationDisplayOutput {
  /** Friendly name of the resource provider. */
  provider?: string;
  /** For example: read, write, delete, or listKeys/action */
  operation?: string;
  /** The resource type on which the operation is performed. */
  resource?: string;
  /** The friendly name of the operation */
  description?: string;
}

/** The CheckNameAvailability operation response. */
export interface CheckNameAvailabilityResultOutput {
  /** Gets a boolean value that indicates whether the name is available for you to use. If true, the name is available. If false, the name has already been taken or invalid and cannot be used. */
  nameAvailable?: boolean;
  /** Gets the reason that a Batch account name could not be used. The Reason element is only returned if NameAvailable is false. */
  reason?: "Invalid" | "AlreadyExists";
  /** Gets an error message explaining the Reason value in more detail. */
  message?: string;
}

/** Values returned by the List operation. */
export interface ListCertificatesResultOutput {
  /** The collection of returned certificates. */
  value?: Array<CertificateOutput>;
  /** The continuation token. */
  nextLink?: string;
}

/** Contains information about a certificate. */
export interface CertificateOutput extends ProxyResourceOutput {
  /** The properties associated with the certificate. */
  properties?: CertificatePropertiesOutput;
}

/** Certificate properties. */
export interface CertificatePropertiesOutput
  extends CertificateBasePropertiesOutput {
  provisioningState?: "Succeeded" | "Deleting" | "Failed";
  /** The time at which the certificate entered its current state. */
  provisioningStateTransitionTime?: string;
  /** The previous provisioned state of the resource */
  previousProvisioningState?: "Succeeded" | "Deleting" | "Failed";
  /** The time at which the certificate entered its previous state. */
  previousProvisioningStateTransitionTime?: string;
  /** The public key of the certificate. */
  publicData?: string;
  /** This is only returned when the certificate provisioningState is 'Failed'. */
  deleteCertificateError?: DeleteCertificateErrorOutput;
}

/** An error response from the Batch service. */
export interface DeleteCertificateErrorOutput {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message: string;
  /** The target of the particular error. For example, the name of the property in error. */
  target?: string;
  /** A list of additional details about the error. */
  details?: Array<DeleteCertificateErrorOutput>;
}

/** Base certificate properties. */
export interface CertificateBasePropertiesOutput {
  /** This must match the first portion of the certificate name. Currently required to be 'SHA1'. */
  thumbprintAlgorithm?: string;
  /** This must match the thumbprint from the name. */
  thumbprint?: string;
  /** The format of the certificate - either Pfx or Cer. If omitted, the default is Pfx. */
  format?: "Pfx" | "Cer";
}

/** Contains information about a certificate. */
export interface CertificateCreateOrUpdateParametersOutput
  extends ProxyResourceOutput {
  /** The properties associated with the certificate. */
  properties?: CertificateCreateOrUpdatePropertiesOutput;
}

/** Certificate properties for create operations */
export interface CertificateCreateOrUpdatePropertiesOutput
  extends CertificateBasePropertiesOutput {
  /** The maximum size is 10KB. */
  data: string;
  /** This must not be specified if the certificate format is Cer. */
  password?: string;
}

/** Values returned by the List operation. */
export interface DetectorListResultOutput {
  /** The collection of Batch account detectors returned by the listing operation. */
  value?: Array<DetectorResponseOutput>;
  /** The URL to get the next set of results. */
  nextLink?: string;
}

/** Contains the information for a detector. */
export interface DetectorResponseOutput extends ProxyResourceOutput {
  /** The properties associated with the detector. */
  properties?: DetectorResponsePropertiesOutput;
}

/** Detector response properties. */
export interface DetectorResponsePropertiesOutput {
  /** A base64 encoded string that represents the content of a detector. */
  value?: string;
}

/** Values returned by the List operation. */
export interface ListPrivateLinkResourcesResultOutput {
  /** The collection of returned private link resources. */
  value?: Array<PrivateLinkResourceOutput>;
  /** The continuation token. */
  nextLink?: string;
}

/** Contains information about a private link resource. */
export interface PrivateLinkResourceOutput extends ProxyResourceOutput {
  /** The properties associated with the private link resource. */
  properties?: PrivateLinkResourcePropertiesOutput;
}

/** Private link resource properties. */
export interface PrivateLinkResourcePropertiesOutput {
  /** The group id is used to establish the private link connection. */
  groupId?: string;
  /** The list of required members that are used to establish the private link connection. */
  requiredMembers?: Array<string>;
  /** The list of required zone names for the private DNS resource name */
  requiredZoneNames?: Array<string>;
}

/** Values returned by the List operation. */
export interface ListPrivateEndpointConnectionsResultOutput {
  /** The collection of returned private endpoint connection. */
  value?: Array<PrivateEndpointConnectionOutput>;
  /** The continuation token. */
  nextLink?: string;
}

/** Values returned by the List operation. */
export interface ListPoolsResultOutput {
  /** The collection of returned pools. */
  value?: Array<PoolOutput>;
  /** The continuation token. */
  nextLink?: string;
}

/** Contains information about a pool. */
export interface PoolOutput extends ProxyResourceOutput {
  /** The properties associated with the pool. */
  properties?: PoolPropertiesOutput;
  /** The type of identity used for the Batch Pool. */
  identity?: BatchPoolIdentityOutput;
}

/** Pool properties. */
export interface PoolPropertiesOutput {
  /** The display name need not be unique and can contain any Unicode characters up to a maximum length of 1024. */
  displayName?: string;
  /** This is the last time at which the pool level data, such as the targetDedicatedNodes or autoScaleSettings, changed. It does not factor in node-level changes such as a compute node changing state. */
  lastModified?: string;
  /** The creation time of the pool. */
  creationTime?: string;
  /** The current state of the pool. */
  provisioningState?: "Succeeded" | "Deleting";
  /** The time at which the pool entered its current state. */
  provisioningStateTransitionTime?: string;
  /** Whether the pool is resizing. */
  allocationState?: "Steady" | "Resizing" | "Stopping";
  /** The time at which the pool entered its current allocation state. */
  allocationStateTransitionTime?: string;
  /** For information about available sizes of virtual machines for Cloud Services pools (pools created with cloudServiceConfiguration), see Sizes for Cloud Services (https://azure.microsoft.com/documentation/articles/cloud-services-sizes-specs/). Batch supports all Cloud Services VM sizes except ExtraSmall. For information about available VM sizes for pools using images from the Virtual Machines Marketplace (pools created with virtualMachineConfiguration) see Sizes for Virtual Machines (Linux) (https://azure.microsoft.com/documentation/articles/virtual-machines-linux-sizes/) or Sizes for Virtual Machines (Windows) (https://azure.microsoft.com/documentation/articles/virtual-machines-windows-sizes/). Batch supports all Azure VM sizes except STANDARD_A0 and those with premium storage (STANDARD_GS, STANDARD_DS, and STANDARD_DSV2 series). */
  vmSize?: string;
  /** Using CloudServiceConfiguration specifies that the nodes should be creating using Azure Cloud Services (PaaS), while VirtualMachineConfiguration uses Azure Virtual Machines (IaaS). */
  deploymentConfiguration?: DeploymentConfigurationOutput;
  /** The number of dedicated compute nodes currently in the pool. */
  currentDedicatedNodes?: number;
  /** The number of Spot/low-priority compute nodes currently in the pool. */
  currentLowPriorityNodes?: number;
  /** Defines the desired size of the pool. This can either be 'fixedScale' where the requested targetDedicatedNodes is specified, or 'autoScale' which defines a formula which is periodically reevaluated. If this property is not specified, the pool will have a fixed scale with 0 targetDedicatedNodes. */
  scaleSettings?: ScaleSettingsOutput;
  /** This property is set only if the pool automatically scales, i.e. autoScaleSettings are used. */
  autoScaleRun?: AutoScaleRunOutput;
  /** This imposes restrictions on which nodes can be assigned to the pool. Enabling this value can reduce the chance of the requested number of nodes to be allocated in the pool. If not specified, this value defaults to 'Disabled'. */
  interNodeCommunication?: "Enabled" | "Disabled";
  /** The network configuration for a pool. */
  networkConfiguration?: NetworkConfigurationOutput;
  /** The default value is 1. The maximum value is the smaller of 4 times the number of cores of the vmSize of the pool or 256. */
  taskSlotsPerNode?: number;
  /** If not specified, the default is spread. */
  taskSchedulingPolicy?: TaskSchedulingPolicyOutput;
  /** The list of user accounts to be created on each node in the pool. */
  userAccounts?: Array<UserAccountOutput>;
  /** The Batch service does not assign any meaning to metadata; it is solely for the use of user code. */
  metadata?: Array<MetadataItemOutput>;
  /** In an PATCH (update) operation, this property can be set to an empty object to remove the start task from the pool. */
  startTask?: StartTaskOutput;
  /**
   * For Windows compute nodes, the Batch service installs the certificates to the specified certificate store and location. For Linux compute nodes, the certificates are stored in a directory inside the task working directory and an environment variable AZ_BATCH_CERTIFICATES_DIR is supplied to the task to query for this location. For certificates with visibility of 'remoteUser', a 'certs' directory is created in the user's home directory (e.g., /home/{user-name}/certs) and certificates are placed in that directory.
   *
   * Warning: This property is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead.
   */
  certificates?: Array<CertificateReferenceOutput>;
  /** Changes to application package references affect all new compute nodes joining the pool, but do not affect compute nodes that are already in the pool until they are rebooted or reimaged. There is a maximum of 10 application package references on any given pool. */
  applicationPackages?: Array<ApplicationPackageReferenceOutput>;
  /** The list of application licenses must be a subset of available Batch service application licenses. If a license is requested which is not supported, pool creation will fail. */
  applicationLicenses?: Array<string>;
  /** Describes either the current operation (if the pool AllocationState is Resizing) or the previously completed operation (if the AllocationState is Steady). */
  resizeOperationStatus?: ResizeOperationStatusOutput;
  /** This supports Azure Files, NFS, CIFS/SMB, and Blobfuse. */
  mountConfiguration?: Array<MountConfigurationOutput>;
  /** If omitted, the default value is Default. */
  targetNodeCommunicationMode?: "Default" | "Classic" | "Simplified";
  /** Determines how a pool communicates with the Batch service. */
  currentNodeCommunicationMode?: "Default" | "Classic" | "Simplified";
}

/** Deployment configuration properties. */
export interface DeploymentConfigurationOutput {
  /** This property and virtualMachineConfiguration are mutually exclusive and one of the properties must be specified. This property cannot be specified if the Batch account was created with its poolAllocationMode property set to 'UserSubscription'. */
  cloudServiceConfiguration?: CloudServiceConfigurationOutput;
  /** This property and cloudServiceConfiguration are mutually exclusive and one of the properties must be specified. */
  virtualMachineConfiguration?: VirtualMachineConfigurationOutput;
}

/** The configuration for nodes in a pool based on the Azure Cloud Services platform. */
export interface CloudServiceConfigurationOutput {
  /** Possible values are: 2 - OS Family 2, equivalent to Windows Server 2008 R2 SP1. 3 - OS Family 3, equivalent to Windows Server 2012. 4 - OS Family 4, equivalent to Windows Server 2012 R2. 5 - OS Family 5, equivalent to Windows Server 2016. 6 - OS Family 6, equivalent to Windows Server 2019. For more information, see Azure Guest OS Releases (https://azure.microsoft.com/documentation/articles/cloud-services-guestos-update-matrix/#releases). */
  osFamily: string;
  /** The default value is * which specifies the latest operating system version for the specified OS family. */
  osVersion?: string;
}

/** The configuration for compute nodes in a pool based on the Azure Virtual Machines infrastructure. */
export interface VirtualMachineConfigurationOutput {
  /** A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation. */
  imageReference: ImageReferenceOutput;
  /** The Batch node agent is a program that runs on each node in the pool, and provides the command-and-control interface between the node and the Batch service. There are different implementations of the node agent, known as SKUs, for different operating systems. You must specify a node agent SKU which matches the selected image reference. To get the list of supported node agent SKUs along with their list of verified image references, see the 'List supported node agent SKUs' operation. */
  nodeAgentSkuId: string;
  /** This property must not be specified if the imageReference specifies a Linux OS image. */
  windowsConfiguration?: WindowsConfigurationOutput;
  /** This property must be specified if the compute nodes in the pool need to have empty data disks attached to them. */
  dataDisks?: Array<DataDiskOutput>;
  /**
   * This only applies to images that contain the Windows operating system, and should only be used when you hold valid on-premises licenses for the nodes which will be deployed. If omitted, no on-premises licensing discount is applied. Values are:
   *
   *  Windows_Server - The on-premises license is for Windows Server.
   *  Windows_Client - The on-premises license is for Windows Client.
   *
   */
  licenseType?: string;
  /** If specified, setup is performed on each node in the pool to allow tasks to run in containers. All regular tasks and job manager tasks run on this pool must specify the containerSettings property, and all other tasks may specify it. */
  containerConfiguration?: ContainerConfigurationOutput;
  /** If specified, encryption is performed on each node in the pool during node provisioning. */
  diskEncryptionConfiguration?: DiskEncryptionConfigurationOutput;
  /** This configuration will specify rules on how nodes in the pool will be physically allocated. */
  nodePlacementConfiguration?: NodePlacementConfigurationOutput;
  /** If specified, the extensions mentioned in this configuration will be installed on each node. */
  extensions?: Array<VMExtensionOutput>;
  /** Contains configuration for ephemeral OSDisk settings. */
  osDisk?: OSDiskOutput;
}

/** A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation. */
export interface ImageReferenceOutput {
  /** For example, Canonical or MicrosoftWindowsServer. */
  publisher?: string;
  /** For example, UbuntuServer or WindowsServer. */
  offer?: string;
  /** For example, 18.04-LTS or 2022-datacenter. */
  sku?: string;
  /** A value of 'latest' can be specified to select the latest version of an image. If omitted, the default is 'latest'. */
  version?: string;
  /** This property is mutually exclusive with other properties. The Shared Image Gallery image must have replicas in the same region as the Azure Batch account. For information about the firewall settings for the Batch node agent to communicate with the Batch service see https://docs.microsoft.com/en-us/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration. */
  id?: string;
}

/** Windows operating system settings to apply to the virtual machine. */
export interface WindowsConfigurationOutput {
  /** If omitted, the default value is true. */
  enableAutomaticUpdates?: boolean;
}

/** Settings which will be used by the data disks associated to Compute Nodes in the Pool. When using attached data disks, you need to mount and format the disks from within a VM to use them. */
export interface DataDiskOutput {
  /** The lun is used to uniquely identify each data disk. If attaching multiple disks, each should have a distinct lun. The value must be between 0 and 63, inclusive. */
  lun: number;
  /**
   * Values are:
   *
   *  none - The caching mode for the disk is not enabled.
   *  readOnly - The caching mode for the disk is read only.
   *  readWrite - The caching mode for the disk is read and write.
   *
   *  The default value for caching is none. For information about the caching options see: https://blogs.msdn.microsoft.com/windowsazurestorage/2012/06/27/exploring-windows-azure-drives-disks-and-images/.
   */
  caching?: "None" | "ReadOnly" | "ReadWrite";
  /** The initial disk size in GB when creating new data disk. */
  diskSizeGB: number;
  /**
   * If omitted, the default is "Standard_LRS". Values are:
   *
   *  Standard_LRS - The data disk should use standard locally redundant storage.
   *  Premium_LRS - The data disk should use premium locally redundant storage.
   */
  storageAccountType?: "Standard_LRS" | "Premium_LRS";
}

/** The configuration for container-enabled pools. */
export interface ContainerConfigurationOutput {
  /** The container technology to be used. */
  type: "DockerCompatible" | "CriCompatible";
  /** This is the full image reference, as would be specified to "docker pull". An image will be sourced from the default Docker registry unless the image is fully qualified with an alternative registry. */
  containerImageNames?: Array<string>;
  /** If any images must be downloaded from a private registry which requires credentials, then those credentials must be provided here. */
  containerRegistries?: Array<ContainerRegistryOutput>;
}

/** A private container registry. */
export interface ContainerRegistryOutput {
  /** The user name to log into the registry server. */
  username?: string;
  /** The password to log into the registry server. */
  password?: string;
  /** If omitted, the default is "docker.io". */
  registryServer?: string;
  /** The reference to a user assigned identity associated with the Batch pool which a compute node will use. */
  identityReference?: ComputeNodeIdentityReferenceOutput;
}

/** The disk encryption configuration applied on compute nodes in the pool. Disk encryption configuration is not supported on Linux pool created with Virtual Machine Image or Shared Image Gallery Image. */
export interface DiskEncryptionConfigurationOutput {
  /** On Linux pool, only "TemporaryDisk" is supported; on Windows pool, "OsDisk" and "TemporaryDisk" must be specified. */
  targets?: Array<"OsDisk" | "TemporaryDisk">;
}

/** Allocation configuration used by Batch Service to provision the nodes. */
export interface NodePlacementConfigurationOutput {
  /** Allocation policy used by Batch Service to provision the nodes. If not specified, Batch will use the regional policy. */
  policy?: "Regional" | "Zonal";
}

/** The configuration for virtual machine extensions. */
export interface VMExtensionOutput {
  /** The name of the virtual machine extension. */
  name: string;
  /** The name of the extension handler publisher. */
  publisher: string;
  /** The type of the extensions. */
  type: string;
  /** The version of script handler. */
  typeHandlerVersion?: string;
  /** Indicates whether the extension should use a newer minor version if one is available at deployment time. Once deployed, however, the extension will not upgrade minor versions unless redeployed, even with this property set to true. */
  autoUpgradeMinorVersion?: boolean;
  /** Indicates whether the extension should be automatically upgraded by the platform if there is a newer version of the extension available. */
  enableAutomaticUpgrade?: boolean;
  /** JSON formatted public settings for the extension. */
  settings?: Record<string, unknown>;
  /** The extension can contain either protectedSettings or protectedSettingsFromKeyVault or no protected settings at all. */
  protectedSettings?: Record<string, unknown>;
  /** Collection of extension names after which this extension needs to be provisioned. */
  provisionAfterExtensions?: Array<string>;
}

/** Settings for the operating system disk of the virtual machine. */
export interface OSDiskOutput {
  /** Specifies the ephemeral Disk Settings for the operating system disk used by the virtual machine. */
  ephemeralOSDiskSettings?: DiffDiskSettingsOutput;
}

/** Specifies the ephemeral Disk Settings for the operating system disk used by the virtual machine. */
export interface DiffDiskSettingsOutput {
  /** This property can be used by user in the request to choose which location the operating system should be in. e.g., cache disk space for Ephemeral OS disk provisioning. For more information on Ephemeral OS disk size requirements, please refer to Ephemeral OS disk size requirements for Windows VMs at https://docs.microsoft.com/en-us/azure/virtual-machines/windows/ephemeral-os-disks#size-requirements and Linux VMs at https://docs.microsoft.com/en-us/azure/virtual-machines/linux/ephemeral-os-disks#size-requirements. */
  placement?: "CacheDisk";
}

/** Defines the desired size of the pool. This can either be 'fixedScale' where the requested targetDedicatedNodes is specified, or 'autoScale' which defines a formula which is periodically reevaluated. If this property is not specified, the pool will have a fixed scale with 0 targetDedicatedNodes. */
export interface ScaleSettingsOutput {
  /** This property and autoScale are mutually exclusive and one of the properties must be specified. */
  fixedScale?: FixedScaleSettingsOutput;
  /** This property and fixedScale are mutually exclusive and one of the properties must be specified. */
  autoScale?: AutoScaleSettingsOutput;
}

/** Fixed scale settings for the pool. */
export interface FixedScaleSettingsOutput {
  /** The default value is 15 minutes. Timeout values use ISO 8601 format. For example, use PT10M for 10 minutes. The minimum value is 5 minutes. If you specify a value less than 5 minutes, the Batch service rejects the request with an error; if you are calling the REST API directly, the HTTP status code is 400 (Bad Request). */
  resizeTimeout?: string;
  /** At least one of targetDedicatedNodes, targetLowPriorityNodes must be set. */
  targetDedicatedNodes?: number;
  /** At least one of targetDedicatedNodes, targetLowPriorityNodes must be set. */
  targetLowPriorityNodes?: number;
  /** If omitted, the default value is Requeue. */
  nodeDeallocationOption?:
    | "Requeue"
    | "Terminate"
    | "TaskCompletion"
    | "RetainedData";
}

/** AutoScale settings for the pool. */
export interface AutoScaleSettingsOutput {
  /** A formula for the desired number of compute nodes in the pool. */
  formula: string;
  /** If omitted, the default value is 15 minutes (PT15M). */
  evaluationInterval?: string;
}

/** The results and errors from an execution of a pool autoscale formula. */
export interface AutoScaleRunOutput {
  /** The time at which the autoscale formula was last evaluated. */
  evaluationTime: string;
  /** Each variable value is returned in the form $variable=value, and variables are separated by semicolons. */
  results?: string;
  /** An error that occurred when autoscaling a pool. */
  error?: AutoScaleRunErrorOutput;
}

/** An error that occurred when autoscaling a pool. */
export interface AutoScaleRunErrorOutput {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message: string;
  /** Additional details about the error. */
  details?: Array<AutoScaleRunErrorOutput>;
}

/** The network configuration for a pool. */
export interface NetworkConfigurationOutput {
  /** The virtual network must be in the same region and subscription as the Azure Batch account. The specified subnet should have enough free IP addresses to accommodate the number of nodes in the pool. If the subnet doesn't have enough free IP addresses, the pool will partially allocate compute nodes and a resize error will occur. The 'MicrosoftAzureBatch' service principal must have the 'Classic Virtual Machine Contributor' Role-Based Access Control (RBAC) role for the specified VNet. The specified subnet must allow communication from the Azure Batch service to be able to schedule tasks on the compute nodes. This can be verified by checking if the specified VNet has any associated Network Security Groups (NSG). If communication to the compute nodes in the specified subnet is denied by an NSG, then the Batch service will set the state of the compute nodes to unusable. If the specified VNet has any associated Network Security Groups (NSG), then a few reserved system ports must be enabled for inbound communication. For pools created with a virtual machine configuration, enable ports 29876 and 29877, as well as port 22 for Linux and port 3389 for Windows. For pools created with a cloud service configuration, enable ports 10100, 20100, and 30100. Also enable outbound connections to Azure Storage on port 443. For cloudServiceConfiguration pools, only 'classic' VNETs are supported. For more details see: https://docs.microsoft.com/en-us/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration */
  subnetId?: string;
  /** The scope of dynamic vnet assignment. */
  dynamicVnetAssignmentScope?: "none" | "job";
  /** Pool endpoint configuration is only supported on pools with the virtualMachineConfiguration property. */
  endpointConfiguration?: PoolEndpointConfigurationOutput;
  /** This property is only supported on Pools with the virtualMachineConfiguration property. */
  publicIPAddressConfiguration?: PublicIPAddressConfigurationOutput;
  /** Accelerated networking enables single root I/O virtualization (SR-IOV) to a VM, which may lead to improved networking performance. For more details, see: https://learn.microsoft.com/azure/virtual-network/accelerated-networking-overview. */
  enableAcceleratedNetworking?: boolean;
}

/** The endpoint configuration for a pool. */
export interface PoolEndpointConfigurationOutput {
  /** The maximum number of inbound NAT pools per Batch pool is 5. If the maximum number of inbound NAT pools is exceeded the request fails with HTTP status code 400. This cannot be specified if the IPAddressProvisioningType is NoPublicIPAddresses. */
  inboundNatPools: Array<InboundNatPoolOutput>;
}

/** A inbound NAT pool that can be used to address specific ports on compute nodes in a Batch pool externally. */
export interface InboundNatPoolOutput {
  /** The name must be unique within a Batch pool, can contain letters, numbers, underscores, periods, and hyphens. Names must start with a letter or number, must end with a letter, number, or underscore, and cannot exceed 77 characters.  If any invalid values are provided the request fails with HTTP status code 400. */
  name: string;
  /** The protocol of the endpoint. */
  protocol: "TCP" | "UDP";
  /** This must be unique within a Batch pool. Acceptable values are between 1 and 65535 except for 22, 3389, 29876 and 29877 as these are reserved. If any reserved values are provided the request fails with HTTP status code 400. */
  backendPort: number;
  /** Acceptable values range between 1 and 65534 except ports from 50000 to 55000 which are reserved. All ranges within a pool must be distinct and cannot overlap. If any reserved or overlapping values are provided the request fails with HTTP status code 400. */
  frontendPortRangeStart: number;
  /** Acceptable values range between 1 and 65534 except ports from 50000 to 55000 which are reserved by the Batch service. All ranges within a pool must be distinct and cannot overlap. If any reserved or overlapping values are provided the request fails with HTTP status code 400. */
  frontendPortRangeEnd: number;
  /** The maximum number of rules that can be specified across all the endpoints on a Batch pool is 25. If no network security group rules are specified, a default rule will be created to allow inbound access to the specified backendPort. If the maximum number of network security group rules is exceeded the request fails with HTTP status code 400. */
  networkSecurityGroupRules?: Array<NetworkSecurityGroupRuleOutput>;
}

/** A network security group rule to apply to an inbound endpoint. */
export interface NetworkSecurityGroupRuleOutput {
  /** Priorities within a pool must be unique and are evaluated in order of priority. The lower the number the higher the priority. For example, rules could be specified with order numbers of 150, 250, and 350. The rule with the order number of 150 takes precedence over the rule that has an order of 250. Allowed priorities are 150 to 4096. If any reserved or duplicate values are provided the request fails with HTTP status code 400. */
  priority: number;
  /** The action that should be taken for a specified IP address, subnet range or tag. */
  access: "Allow" | "Deny";
  /** Valid values are a single IP address (i.e. 10.10.10.10), IP subnet (i.e. 192.168.1.0/24), default tag, or * (for all addresses).  If any other values are provided the request fails with HTTP status code 400. */
  sourceAddressPrefix: string;
  /** Valid values are '*' (for all ports 0 - 65535) or arrays of ports or port ranges (i.e. 100-200). The ports should in the range of 0 to 65535 and the port ranges or ports can't overlap. If any other values are provided the request fails with HTTP status code 400. Default value will be *. */
  sourcePortRanges?: Array<string>;
}

/** The public IP Address configuration of the networking configuration of a Pool. */
export interface PublicIPAddressConfigurationOutput {
  /** The default value is BatchManaged */
  provision?: "BatchManaged" | "UserManaged" | "NoPublicIPAddresses";
  /** The number of IPs specified here limits the maximum size of the Pool - 100 dedicated nodes or 100 Spot/low-priority nodes can be allocated for each public IP. For example, a pool needing 250 dedicated VMs would need at least 3 public IPs specified. Each element of this collection is of the form: /subscriptions/{subscription}/resourceGroups/{group}/providers/Microsoft.Network/publicIPAddresses/{ip}. */
  ipAddressIds?: Array<string>;
}

/** Specifies how tasks should be distributed across compute nodes. */
export interface TaskSchedulingPolicyOutput {
  /** How tasks should be distributed across compute nodes. */
  nodeFillType: "Spread" | "Pack";
}

/** Properties used to create a user on an Azure Batch node. */
export interface UserAccountOutput {
  /** The name of the user account. Names can contain any Unicode characters up to a maximum length of 20. */
  name: string;
  /** The password for the user account. */
  password: string;
  /** nonAdmin - The auto user is a standard user without elevated access. admin - The auto user is a user with elevated access and operates with full Administrator permissions. The default value is nonAdmin. */
  elevationLevel?: "NonAdmin" | "Admin";
  /** This property is ignored if specified on a Windows pool. If not specified, the user is created with the default options. */
  linuxUserConfiguration?: LinuxUserConfigurationOutput;
  /** This property can only be specified if the user is on a Windows pool. If not specified and on a Windows pool, the user is created with the default options. */
  windowsUserConfiguration?: WindowsUserConfigurationOutput;
}

/** Properties used to create a user account on a Linux node. */
export interface LinuxUserConfigurationOutput {
  /** The uid and gid properties must be specified together or not at all. If not specified the underlying operating system picks the uid. */
  uid?: number;
  /** The uid and gid properties must be specified together or not at all. If not specified the underlying operating system picks the gid. */
  gid?: number;
  /** The private key must not be password protected. The private key is used to automatically configure asymmetric-key based authentication for SSH between nodes in a Linux pool when the pool's enableInterNodeCommunication property is true (it is ignored if enableInterNodeCommunication is false). It does this by placing the key pair into the user's .ssh directory. If not specified, password-less SSH is not configured between nodes (no modification of the user's .ssh directory is done). */
  sshPrivateKey?: string;
}

/** Properties used to create a user account on a Windows node. */
export interface WindowsUserConfigurationOutput {
  /** Specifies login mode for the user. The default value for VirtualMachineConfiguration pools is interactive mode and for CloudServiceConfiguration pools is batch mode. */
  loginMode?: "Batch" | "Interactive";
}

/** The Batch service does not assign any meaning to this metadata; it is solely for the use of user code. */
export interface MetadataItemOutput {
  /** The name of the metadata item. */
  name: string;
  /** The value of the metadata item. */
  value: string;
}

/** In some cases the start task may be re-run even though the node was not rebooted. Due to this, start tasks should be idempotent and exit gracefully if the setup they're performing has already been done. Special care should be taken to avoid start tasks which create breakaway process or install/launch services from the start task working directory, as this will block Batch from being able to re-run the start task. */
export interface StartTaskOutput {
  /** The command line does not run under a shell, and therefore cannot take advantage of shell features such as environment variable expansion. If you want to take advantage of such features, you should invoke the shell in the command line, for example using "cmd /c MyCommand" in Windows or "/bin/sh -c MyCommand" in Linux. Required if any other properties of the startTask are specified. */
  commandLine?: string;
  /** A list of files that the Batch service will download to the compute node before running the command line. */
  resourceFiles?: Array<ResourceFileOutput>;
  /** A list of environment variable settings for the start task. */
  environmentSettings?: Array<EnvironmentSettingOutput>;
  /** If omitted, the task runs as a non-administrative user unique to the task. */
  userIdentity?: UserIdentityOutput;
  /** The Batch service retries a task if its exit code is nonzero. Note that this value specifically controls the number of retries. The Batch service will try the task once, and may then retry up to this limit. For example, if the maximum retry count is 3, Batch tries the task up to 4 times (one initial try and 3 retries). If the maximum retry count is 0, the Batch service does not retry the task. If the maximum retry count is -1, the Batch service retries the task without limit. */
  maxTaskRetryCount?: number;
  /** If true and the start task fails on a compute node, the Batch service retries the start task up to its maximum retry count (maxTaskRetryCount). If the task has still not completed successfully after all retries, then the Batch service marks the compute node unusable, and will not schedule tasks to it. This condition can be detected via the node state and scheduling error detail. If false, the Batch service will not wait for the start task to complete. In this case, other tasks can start executing on the compute node while the start task is still running; and even if the start task fails, new tasks will continue to be scheduled on the node. The default is true. */
  waitForSuccess?: boolean;
  /** When this is specified, all directories recursively below the AZ_BATCH_NODE_ROOT_DIR (the root of Azure Batch directories on the node) are mapped into the container, all task environment variables are mapped into the container, and the task command line is executed in the container. */
  containerSettings?: TaskContainerSettingsOutput;
}

/** A single file or multiple files to be downloaded to a compute node. */
export interface ResourceFileOutput {
  /** The autoStorageContainerName, storageContainerUrl and httpUrl properties are mutually exclusive and one of them must be specified. */
  autoStorageContainerName?: string;
  /** The autoStorageContainerName, storageContainerUrl and httpUrl properties are mutually exclusive and one of them must be specified. This URL must be readable and listable from compute nodes. There are three ways to get such a URL for a container in Azure storage: include a Shared Access Signature (SAS) granting read and list permissions on the container, use a managed identity with read and list permissions, or set the ACL for the container to allow public access. */
  storageContainerUrl?: string;
  /** The autoStorageContainerName, storageContainerUrl and httpUrl properties are mutually exclusive and one of them must be specified. If the URL points to Azure Blob Storage, it must be readable from compute nodes. There are three ways to get such a URL for a blob in Azure storage: include a Shared Access Signature (SAS) granting read permissions on the blob, use a managed identity with read permission, or set the ACL for the blob or its container to allow public access. */
  httpUrl?: string;
  /** The property is valid only when autoStorageContainerName or storageContainerUrl is used. This prefix can be a partial filename or a subdirectory. If a prefix is not specified, all the files in the container will be downloaded. */
  blobPrefix?: string;
  /** If the httpUrl property is specified, the filePath is required and describes the path which the file will be downloaded to, including the filename. Otherwise, if the autoStorageContainerName or storageContainerUrl property is specified, filePath is optional and is the directory to download the files to. In the case where filePath is used as a directory, any directory structure already associated with the input data will be retained in full and appended to the specified filePath directory. The specified relative path cannot break out of the task's working directory (for example by using '..'). */
  filePath?: string;
  /** This property applies only to files being downloaded to Linux compute nodes. It will be ignored if it is specified for a resourceFile which will be downloaded to a Windows node. If this property is not specified for a Linux node, then a default value of 0770 is applied to the file. */
  fileMode?: string;
  /** The reference to a user assigned identity associated with the Batch pool which a compute node will use. */
  identityReference?: ComputeNodeIdentityReferenceOutput;
}

/** An environment variable to be set on a task process. */
export interface EnvironmentSettingOutput {
  /** The name of the environment variable. */
  name: string;
  /** The value of the environment variable. */
  value?: string;
}

/** Specify either the userName or autoUser property, but not both. */
export interface UserIdentityOutput {
  /** The userName and autoUser properties are mutually exclusive; you must specify one but not both. */
  userName?: string;
  /** The userName and autoUser properties are mutually exclusive; you must specify one but not both. */
  autoUser?: AutoUserSpecificationOutput;
}

/** Specifies the parameters for the auto user that runs a task on the Batch service. */
export interface AutoUserSpecificationOutput {
  /** The default value is Pool. If the pool is running Windows a value of Task should be specified if stricter isolation between tasks is required. For example, if the task mutates the registry in a way which could impact other tasks, or if certificates have been specified on the pool which should not be accessible by normal tasks but should be accessible by start tasks. */
  scope?: "Task" | "Pool";
  /** The default value is nonAdmin. */
  elevationLevel?: "NonAdmin" | "Admin";
}

/** The container settings for a task. */
export interface TaskContainerSettingsOutput {
  /** These additional options are supplied as arguments to the "docker create" command, in addition to those controlled by the Batch Service. */
  containerRunOptions?: string;
  /** This is the full image reference, as would be specified to "docker pull". If no tag is provided as part of the image name, the tag ":latest" is used as a default. */
  imageName: string;
  /** This setting can be omitted if was already provided at pool creation. */
  registry?: ContainerRegistryOutput;
  /** A flag to indicate where the container task working directory is. The default is 'taskWorkingDirectory'. */
  workingDirectory?: "TaskWorkingDirectory" | "ContainerImageDefault";
}

/** Warning: This object is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateReferenceOutput {
  /** The fully qualified ID of the certificate to install on the pool. This must be inside the same batch account as the pool. */
  id: string;
  /** The default value is currentUser. This property is applicable only for pools configured with Windows nodes (that is, created with cloudServiceConfiguration, or with virtualMachineConfiguration using a Windows image reference). For Linux compute nodes, the certificates are stored in a directory inside the task working directory and an environment variable AZ_BATCH_CERTIFICATES_DIR is supplied to the task to query for this location. For certificates with visibility of 'remoteUser', a 'certs' directory is created in the user's home directory (e.g., /home/{user-name}/certs) and certificates are placed in that directory. */
  storeLocation?: "CurrentUser" | "LocalMachine";
  /** This property is applicable only for pools configured with Windows nodes (that is, created with cloudServiceConfiguration, or with virtualMachineConfiguration using a Windows image reference). Common store names include: My, Root, CA, Trust, Disallowed, TrustedPeople, TrustedPublisher, AuthRoot, AddressBook, but any custom store name can also be used. The default value is My. */
  storeName?: string;
  /** Which user accounts on the compute node should have access to the private data of the certificate. */
  visibility?: Array<"StartTask" | "Task" | "RemoteUser">;
}

/** Link to an application package inside the batch account */
export interface ApplicationPackageReferenceOutput {
  /** The ID of the application package to install. This must be inside the same batch account as the pool. This can either be a reference to a specific version or the default version if one exists. */
  id: string;
  /** If this is omitted, and no default version is specified for this application, the request fails with the error code InvalidApplicationPackageReferences. If you are calling the REST API directly, the HTTP status code is 409. */
  version?: string;
}

/** Describes either the current operation (if the pool AllocationState is Resizing) or the previously completed operation (if the AllocationState is Steady). */
export interface ResizeOperationStatusOutput {
  /** The desired number of dedicated compute nodes in the pool. */
  targetDedicatedNodes?: number;
  /** The desired number of Spot/low-priority compute nodes in the pool. */
  targetLowPriorityNodes?: number;
  /** The default value is 15 minutes. The minimum value is 5 minutes. If you specify a value less than 5 minutes, the Batch service returns an error; if you are calling the REST API directly, the HTTP status code is 400 (Bad Request). */
  resizeTimeout?: string;
  /** The default value is requeue. */
  nodeDeallocationOption?:
    | "Requeue"
    | "Terminate"
    | "TaskCompletion"
    | "RetainedData";
  /** The time when this resize operation was started. */
  startTime?: string;
  /** This property is set only if an error occurred during the last pool resize, and only when the pool allocationState is Steady. */
  errors?: Array<ResizeErrorOutput>;
}

/** An error that occurred when resizing a pool. */
export interface ResizeErrorOutput {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message: string;
  /** Additional details about the error. */
  details?: Array<ResizeErrorOutput>;
}

/** The file system to mount on each node. */
export interface MountConfigurationOutput {
  /** This property is mutually exclusive with all other properties. */
  azureBlobFileSystemConfiguration?: AzureBlobFileSystemConfigurationOutput;
  /** This property is mutually exclusive with all other properties. */
  nfsMountConfiguration?: NFSMountConfigurationOutput;
  /** This property is mutually exclusive with all other properties. */
  cifsMountConfiguration?: CifsMountConfigurationOutput;
  /** This property is mutually exclusive with all other properties. */
  azureFileShareConfiguration?: AzureFileShareConfigurationOutput;
}

/** Information used to connect to an Azure Storage Container using Blobfuse. */
export interface AzureBlobFileSystemConfigurationOutput {
  /** The Azure Storage Account name. */
  accountName: string;
  /** The Azure Blob Storage Container name. */
  containerName: string;
  /** This property is mutually exclusive with both sasKey and identity; exactly one must be specified. */
  accountKey?: string;
  /** This property is mutually exclusive with both accountKey and identity; exactly one must be specified. */
  sasKey?: string;
  /** These are 'net use' options in Windows and 'mount' options in Linux. */
  blobfuseOptions?: string;
  /** All file systems are mounted relative to the Batch mounts directory, accessible via the AZ_BATCH_NODE_MOUNTS_DIR environment variable. */
  relativeMountPath: string;
  /** This property is mutually exclusive with both accountKey and sasKey; exactly one must be specified. */
  identityReference?: ComputeNodeIdentityReferenceOutput;
}

/** Information used to connect to an NFS file system. */
export interface NFSMountConfigurationOutput {
  /** The URI of the file system to mount. */
  source: string;
  /** All file systems are mounted relative to the Batch mounts directory, accessible via the AZ_BATCH_NODE_MOUNTS_DIR environment variable. */
  relativeMountPath: string;
  /** These are 'net use' options in Windows and 'mount' options in Linux. */
  mountOptions?: string;
}

/** Information used to connect to a CIFS file system. */
export interface CifsMountConfigurationOutput {
  /** The user to use for authentication against the CIFS file system. */
  userName: string;
  /** The URI of the file system to mount. */
  source: string;
  /** All file systems are mounted relative to the Batch mounts directory, accessible via the AZ_BATCH_NODE_MOUNTS_DIR environment variable. */
  relativeMountPath: string;
  /** These are 'net use' options in Windows and 'mount' options in Linux. */
  mountOptions?: string;
  /** The password to use for authentication against the CIFS file system. */
  password: string;
}

/** Information used to connect to an Azure Fileshare. */
export interface AzureFileShareConfigurationOutput {
  /** The Azure Storage account name. */
  accountName: string;
  /** This is of the form 'https://{account}.file.core.windows.net/'. */
  azureFileUrl: string;
  /** The Azure Storage account key. */
  accountKey: string;
  /** All file systems are mounted relative to the Batch mounts directory, accessible via the AZ_BATCH_NODE_MOUNTS_DIR environment variable. */
  relativeMountPath: string;
  /** These are 'net use' options in Windows and 'mount' options in Linux. */
  mountOptions?: string;
}

/** The identity of the Batch pool, if configured. If the pool identity is updated during update an existing pool, only the new vms which are created after the pool shrinks to 0 will have the updated identities */
export interface BatchPoolIdentityOutput {
  /** The type of identity used for the Batch Pool. */
  type: "UserAssigned" | "None";
  /** The list of user identities associated with the Batch pool. */
  userAssignedIdentities?: Record<string, UserAssignedIdentitiesOutput>;
}

/** Values returned by the List operation. */
export interface OutboundEnvironmentEndpointCollectionOutput {
  /** The collection of outbound network dependency endpoints returned by the listing operation. */
  value?: Array<OutboundEnvironmentEndpointOutput>;
  /** The continuation token. */
  nextLink?: string;
}

/** A collection of related endpoints from the same service for which the Batch service requires outbound access. */
export interface OutboundEnvironmentEndpointOutput {
  /** The type of service that the Batch service connects to. */
  category?: string;
  /** The endpoints for this service to which the Batch service makes outbound calls. */
  endpoints?: Array<EndpointDependencyOutput>;
}

/** A domain name and connection details used to access a dependency. */
export interface EndpointDependencyOutput {
  /** The domain name of the dependency. Domain names may be fully qualified or may contain a * wildcard. */
  domainName?: string;
  /** Human-readable supplemental information about the dependency and when it is applicable. */
  description?: string;
  /** The list of connection details for this endpoint. */
  endpointDetails?: Array<EndpointDetailOutput>;
}

/** Details about the connection between the Batch service and the endpoint. */
export interface EndpointDetailOutput {
  /** The port an endpoint is connected to. */
  port?: number;
}
