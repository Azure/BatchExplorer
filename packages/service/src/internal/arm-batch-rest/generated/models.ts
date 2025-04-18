// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

/** Parameters supplied to the Create operation. */
export interface AccountBatchCreateParameters {
  /** The region in which to create the account. */
  location: string;
  /** The user-specified tags associated with the account. */
  tags?: Record<string, string>;
  /** The properties of the Batch account. */
  properties?: BatchAccountCreateProperties;
  /** The identity of the Batch account. */
  identity?: BatchAccountIdentity;
}

/** The properties of a Batch account. */
export interface BatchAccountCreateProperties {
  /** The properties related to the auto-storage account. */
  autoStorage?: AutoStorageBaseProperties;
  /** The pool allocation mode also affects how clients may authenticate to the Batch Service API. If the mode is BatchService, clients may authenticate using access keys or Microsoft Entra ID. If the mode is UserSubscription, clients must use Microsoft Entra ID. The default is BatchService. */
  poolAllocationMode?: "BatchService" | "UserSubscription";
  /** A reference to the Azure key vault associated with the Batch account. */
  keyVaultReference?: KeyVaultReference;
  /** If not specified, the default value is 'enabled'. */
  publicNetworkAccess?: "Enabled" | "Disabled" | "SecuredByPerimeter";
  /** The network profile only takes effect when publicNetworkAccess is enabled. */
  networkProfile?: NetworkProfile;
  /** Configures how customer data is encrypted inside the Batch account. By default, accounts are encrypted using a Microsoft managed key. For additional control, a customer-managed key can be used instead. */
  encryption?: EncryptionProperties;
  /** List of allowed authentication modes for the Batch account that can be used to authenticate with the data plane. This does not affect authentication with the control plane. */
  allowedAuthenticationModes?: Array<
    "SharedKey" | "AAD" | "TaskAuthenticationToken"
  >;
}

/** The properties related to the auto-storage account. */
export interface AutoStorageBaseProperties {
  /** The resource ID of the storage account to be used for auto-storage account. */
  storageAccountId: string;
  /** The authentication mode which the Batch service will use to manage the auto-storage account. */
  authenticationMode?: "StorageKeys" | "BatchAccountManagedIdentity";
  /** The identity referenced here must be assigned to pools which have compute nodes that need access to auto-storage. */
  nodeIdentityReference?: ComputeNodeIdentityReference;
}

/** The reference to a user assigned identity associated with the Batch pool which a compute node will use. */
export interface ComputeNodeIdentityReference {
  /** The ARM resource id of the user assigned identity. */
  resourceId?: string;
}

/** Identifies the Azure key vault associated with a Batch account. */
export interface KeyVaultReference {
  /** The resource ID of the Azure key vault associated with the Batch account. */
  id: string;
  /** The URL of the Azure key vault associated with the Batch account. */
  url: string;
}

/** Network profile for Batch account, which contains network rule settings for each endpoint. */
export interface NetworkProfile {
  /** Network access profile for batchAccount endpoint (Batch account data plane API). */
  accountAccess?: EndpointAccessProfile;
  /** Network access profile for nodeManagement endpoint (Batch service managing compute nodes for Batch pools). */
  nodeManagementAccess?: EndpointAccessProfile;
}

/** Network access profile for Batch endpoint. */
export interface EndpointAccessProfile {
  /** Default action for endpoint access. It is only applicable when publicNetworkAccess is enabled. */
  defaultAction: "Allow" | "Deny";
  /** Array of IP ranges to filter client IP address. */
  ipRules?: Array<IPRule>;
}

/** Rule to filter client IP address. */
export interface IPRule {
  /** Action when client IP address is matched. */
  action: "Allow";
  /** IPv4 address, or IPv4 address range in CIDR format. */
  value: string;
}

/** Configures how customer data is encrypted inside the Batch account. By default, accounts are encrypted using a Microsoft managed key. For additional control, a customer-managed key can be used instead. */
export interface EncryptionProperties {
  /** Type of the key source. */
  keySource?: "Microsoft.Batch" | "Microsoft.KeyVault";
  /** Additional details when using Microsoft.KeyVault */
  keyVaultProperties?: KeyVaultProperties;
}

/** KeyVault configuration when using an encryption KeySource of Microsoft.KeyVault. */
export interface KeyVaultProperties {
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
export interface BatchAccountIdentity {
  /** The principal id of the Batch account. This property will only be provided for a system assigned identity. */
  principalId?: string;
  /** The tenant id associated with the Batch account. This property will only be provided for a system assigned identity. */
  tenantId?: string;
  /** The type of identity used for the Batch account. */
  type: "SystemAssigned" | "UserAssigned" | "None";
  /** The list of user identities associated with the Batch account. */
  userAssignedIdentities?: Record<string, UserAssignedIdentities>;
}

/** The list of associated user identities. */
export interface UserAssignedIdentities {
  /** The principal id of user assigned identity. */
  principalId?: string;
  /** The client id of user assigned identity. */
  clientId?: string;
}

/** Contains information about a private link resource. */
export interface PrivateEndpointConnection extends AzureProxyResource {
  /** The properties associated with the private endpoint connection. */
  properties?: PrivateEndpointConnectionProperties;
}

/** Private endpoint connection properties. */
export interface PrivateEndpointConnectionProperties {
  /** The provisioning state of the private endpoint connection. */
  provisioningState?:
    | "Creating"
    | "Updating"
    | "Deleting"
    | "Succeeded"
    | "Failed"
    | "Cancelled";
  /** The private endpoint of the private endpoint connection. */
  privateEndpoint?: PrivateEndpoint;
  /** The value has one and only one group id. */
  groupIds?: Array<string>;
  /** The private link service connection state of the private endpoint connection */
  privateLinkServiceConnectionState?: PrivateLinkServiceConnectionState;
}

/** The private endpoint of the private endpoint connection. */
export interface PrivateEndpoint {
  /** The ARM resource identifier of the private endpoint. This is of the form /subscriptions/{subscription}/resourceGroups/{group}/providers/Microsoft.Network/privateEndpoints/{privateEndpoint}. */
  id?: string;
}

/** The private link service connection state of the private endpoint connection */
export interface PrivateLinkServiceConnectionState {
  /** The status of the Batch private endpoint connection */
  status: "Approved" | "Pending" | "Rejected" | "Disconnected";
  /** Description of the private Connection state */
  description?: string;
  /** Action required on the private connection state */
  actionsRequired?: string;
}

/** A definition of an Azure resource. */
export interface AzureProxyResource {
  /** The ID of the resource. */
  id?: string;
  /** The name of the resource. */
  name?: string;
  /** The type of the resource. */
  type?: string;
  /** The ETag of the resource, used for concurrency statements. */
  etag?: string;
  /** The tags of the resource. */
  tags?: Record<string, string>;
}

/** Contains information about the auto-storage account associated with a Batch account. */
export interface AutoStorageProperties extends AutoStorageBaseProperties {
  /** The UTC time at which storage keys were last synchronized with the Batch account. */
  lastKeySync: Date | string;
}

/** Parameters for updating an Azure Batch account. */
export interface AccountBatchUpdateParameters {
  /** The user-specified tags associated with the account. */
  tags?: Record<string, string>;
  /** The properties of the account. */
  properties?: BatchAccountUpdateProperties;
  /** The identity of the Batch account. */
  identity?: BatchAccountIdentity;
}

/** The properties of a Batch account. */
export interface BatchAccountUpdateProperties {
  /** The properties related to the auto-storage account. */
  autoStorage?: AutoStorageBaseProperties;
  /** Configures how customer data is encrypted inside the Batch account. By default, accounts are encrypted using a Microsoft managed key. For additional control, a customer-managed key can be used instead. */
  encryption?: EncryptionProperties;
  /** List of allowed authentication modes for the Batch account that can be used to authenticate with the data plane. This does not affect authentication with the control plane. */
  allowedAuthenticationModes?: Array<
    "SharedKey" | "AAD" | "TaskAuthenticationToken"
  >;
  /** If not specified, the default value is 'enabled'. */
  publicNetworkAccess?: "Enabled" | "Disabled" | "SecuredByPerimeter";
  /** The network profile only takes effect when publicNetworkAccess is enabled. */
  networkProfile?: NetworkProfile;
}

/** Parameters supplied to the RegenerateKey operation. */
export interface AccountBatchRegenerateKeyParameters {
  /** The type of account key to regenerate. */
  keyName: "Primary" | "Secondary";
}

/** Parameters for an activating an application package. */
export interface ActivateApplicationPackageParameters {
  /** The format of the application package binary file. */
  format: string;
}

/** An application package which represents a particular version of an application. */
export interface ApplicationPackage extends AzureProxyResource {
  /** The properties associated with the Application Package. */
  properties?: ApplicationPackageProperties;
}

/** Properties of an application package */
export interface ApplicationPackageProperties {
  /** The current state of the application package. */
  state?: "Pending" | "Active";
  /** The format of the application package, if the package is active. */
  format?: string;
  /** The URL for the application package in Azure Storage. */
  storageUrl?: string;
  /** The UTC time at which the Azure Storage URL will expire. */
  storageUrlExpiry?: Date | string;
  /** The time at which the package was last activated, if the package is active. */
  lastActivationTime?: Date | string;
}

/** Contains information about an application in a Batch account. */
export interface Application extends AzureProxyResource {
  /** The properties associated with the Application. */
  properties?: ApplicationProperties;
}

/** The properties associated with the Application. */
export interface ApplicationProperties {
  /** The display name for the application. */
  displayName?: string;
  /** A value indicating whether packages within the application may be overwritten using the same version string. */
  allowUpdates?: boolean;
  /** The package to use if a client requests the application but does not specify a version. This property can only be set to the name of an existing package. */
  defaultVersion?: string;
}

/** Parameters for a check name availability request. */
export interface CheckNameAvailabilityParameters {
  /** The name to check for availability */
  name: string;
  /** The resource type. */
  type: "Microsoft.Batch/batchAccounts";
}

/** Contains information about a certificate. */
export interface Certificate extends AzureProxyResource {
  /** The properties associated with the certificate. */
  properties?: CertificateProperties;
}

/** Certificate properties. */
export interface CertificateProperties extends CertificateBaseProperties {
  provisioningState?: "Succeeded" | "Deleting" | "Failed";
  /** The time at which the certificate entered its current state. */
  provisioningStateTransitionTime?: Date | string;
  /** The previous provisioned state of the resource */
  previousProvisioningState?: "Succeeded" | "Deleting" | "Failed";
  /** The time at which the certificate entered its previous state. */
  previousProvisioningStateTransitionTime?: Date | string;
  /** The public key of the certificate. */
  publicData?: string;
  /** This is only returned when the certificate provisioningState is 'Failed'. */
  deleteCertificateError?: DeleteCertificateError;
}

/** An error response from the Batch service. */
export interface DeleteCertificateError {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message: string;
  /** The target of the particular error. For example, the name of the property in error. */
  target?: string;
  /** A list of additional details about the error. */
  details?: Array<DeleteCertificateError>;
}

/** Base certificate properties. */
export interface CertificateBaseProperties {
  /** This must match the first portion of the certificate name. Currently required to be 'SHA1'. */
  thumbprintAlgorithm?: string;
  /** This must match the thumbprint from the name. */
  thumbprint?: string;
  /** The format of the certificate - either Pfx or Cer. If omitted, the default is Pfx. */
  format?: "Pfx" | "Cer";
}

/** Contains information about a certificate. */
export interface CertificateCreateOrUpdateParameters
  extends AzureProxyResource {
  /** The properties associated with the certificate. */
  properties?: CertificateCreateOrUpdateProperties;
}

/** Certificate properties for create operations */
export interface CertificateCreateOrUpdateProperties
  extends CertificateBaseProperties {
  /** The maximum size is 10KB. */
  data: string;
  /** This must not be specified if the certificate format is Cer. */
  password?: string;
}

/** Contains the information for a detector. */
export interface DetectorResponse extends AzureProxyResource {
  /** The properties associated with the detector. */
  properties?: DetectorResponseProperties;
}

/** Detector response properties. */
export interface DetectorResponseProperties {
  /** A base64 encoded string that represents the content of a detector. */
  value?: string;
}

/** Contains information about a private link resource. */
export interface PrivateLinkResource extends AzureProxyResource {
  /** The properties associated with the private link resource. */
  properties?: PrivateLinkResourceProperties;
}

/** Private link resource properties. */
export interface PrivateLinkResourceProperties {
  /** The group id is used to establish the private link connection. */
  groupId?: string;
  /** The list of required members that are used to establish the private link connection. */
  requiredMembers?: Array<string>;
  /** The list of required zone names for the private DNS resource name */
  requiredZoneNames?: Array<string>;
}

/** Contains information about a pool. */
export interface Pool extends AzureProxyResource {
  /** The properties associated with the pool. */
  properties?: PoolProperties;
  /** The type of identity used for the Batch Pool. */
  identity?: BatchPoolIdentity;
}

/** Pool properties. */
export interface PoolProperties {
  /** The display name need not be unique and can contain any Unicode characters up to a maximum length of 1024. */
  displayName?: string;
  /** This is the last time at which the pool level data, such as the targetDedicatedNodes or autoScaleSettings, changed. It does not factor in node-level changes such as a compute node changing state. */
  lastModified?: Date | string;
  /** The creation time of the pool. */
  creationTime?: Date | string;
  /** The current state of the pool. */
  provisioningState?: "Succeeded" | "Deleting";
  /** The time at which the pool entered its current state. */
  provisioningStateTransitionTime?: Date | string;
  /** Whether the pool is resizing. */
  allocationState?: "Steady" | "Resizing" | "Stopping";
  /** The time at which the pool entered its current allocation state. */
  allocationStateTransitionTime?: Date | string;
  /** For information about available VM sizes, see Sizes for Virtual Machines in Azure (https://learn.microsoft.com/azure/virtual-machines/sizes/overview). Batch supports all Azure VM sizes except STANDARD_A0 and those with premium storage (STANDARD_GS, STANDARD_DS, and STANDARD_DSV2 series). */
  vmSize?: string;
  /** Deployment configuration properties. */
  deploymentConfiguration?: DeploymentConfiguration;
  /** The number of dedicated compute nodes currently in the pool. */
  currentDedicatedNodes?: number;
  /** The number of Spot/low-priority compute nodes currently in the pool. */
  currentLowPriorityNodes?: number;
  /** Defines the desired size of the pool. This can either be 'fixedScale' where the requested targetDedicatedNodes is specified, or 'autoScale' which defines a formula which is periodically reevaluated. If this property is not specified, the pool will have a fixed scale with 0 targetDedicatedNodes. */
  scaleSettings?: ScaleSettings;
  /** This property is set only if the pool automatically scales, i.e. autoScaleSettings are used. */
  autoScaleRun?: AutoScaleRun;
  /** This imposes restrictions on which nodes can be assigned to the pool. Enabling this value can reduce the chance of the requested number of nodes to be allocated in the pool. If not specified, this value defaults to 'Disabled'. */
  interNodeCommunication?: "Enabled" | "Disabled";
  /** The network configuration for a pool. */
  networkConfiguration?: NetworkConfiguration;
  /** The default value is 1. The maximum value is the smaller of 4 times the number of cores of the vmSize of the pool or 256. */
  taskSlotsPerNode?: number;
  /** If not specified, the default is spread. */
  taskSchedulingPolicy?: TaskSchedulingPolicy;
  /** The list of user accounts to be created on each node in the pool. */
  userAccounts?: Array<UserAccount>;
  /** The Batch service does not assign any meaning to metadata; it is solely for the use of user code. */
  metadata?: Array<MetadataItem>;
  /** In an PATCH (update) operation, this property can be set to an empty object to remove the start task from the pool. */
  startTask?: StartTask;
  /**
   * For Windows compute nodes, the Batch service installs the certificates to the specified certificate store and location. For Linux compute nodes, the certificates are stored in a directory inside the task working directory and an environment variable AZ_BATCH_CERTIFICATES_DIR is supplied to the task to query for this location. For certificates with visibility of 'remoteUser', a 'certs' directory is created in the user's home directory (e.g., /home/{user-name}/certs) and certificates are placed in that directory.
   *
   * Warning: This property is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead.
   */
  certificates?: Array<CertificateReference>;
  /** Changes to application package references affect all new compute nodes joining the pool, but do not affect compute nodes that are already in the pool until they are rebooted or reimaged. There is a maximum of 10 application package references on any given pool. */
  applicationPackages?: Array<ApplicationPackageReference>;
  /** The list of application licenses must be a subset of available Batch service application licenses. If a license is requested which is not supported, pool creation will fail. */
  applicationLicenses?: Array<string>;
  /** Describes either the current operation (if the pool AllocationState is Resizing) or the previously completed operation (if the AllocationState is Steady). */
  resizeOperationStatus?: ResizeOperationStatus;
  /** This supports Azure Files, NFS, CIFS/SMB, and Blobfuse. */
  mountConfiguration?: Array<MountConfiguration>;
  /** If omitted, the default value is Default. */
  targetNodeCommunicationMode?: "Default" | "Classic" | "Simplified";
  /** Determines how a pool communicates with the Batch service. */
  currentNodeCommunicationMode?: "Default" | "Classic" | "Simplified";
  /** Describes an upgrade policy - automatic, manual, or rolling. */
  upgradePolicy?: UpgradePolicy;
  /** The user-defined tags to be associated with the Azure Batch Pool. When specified, these tags are propagated to the backing Azure resources associated with the pool. This property can only be specified when the Batch account was created with the poolAllocationMode property set to 'UserSubscription'. */
  resourceTags?: Record<string, string>;
}

/** Deployment configuration properties. */
export interface DeploymentConfiguration {
  /** The configuration for compute nodes in a pool based on the Azure Virtual Machines infrastructure. */
  virtualMachineConfiguration?: VirtualMachineConfiguration;
}

/** The configuration for compute nodes in a pool based on the Azure Virtual Machines infrastructure. */
export interface VirtualMachineConfiguration {
  /** A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation. */
  imageReference: ImageReference;
  /** The Batch node agent is a program that runs on each node in the pool, and provides the command-and-control interface between the node and the Batch service. There are different implementations of the node agent, known as SKUs, for different operating systems. You must specify a node agent SKU which matches the selected image reference. To get the list of supported node agent SKUs along with their list of verified image references, see the 'List supported node agent SKUs' operation. */
  nodeAgentSkuId: string;
  /** This property must not be specified if the imageReference specifies a Linux OS image. */
  windowsConfiguration?: WindowsConfiguration;
  /** This property must be specified if the compute nodes in the pool need to have empty data disks attached to them. */
  dataDisks?: Array<DataDisk>;
  /**
   * This only applies to images that contain the Windows operating system, and should only be used when you hold valid on-premises licenses for the nodes which will be deployed. If omitted, no on-premises licensing discount is applied. Values are:
   *
   *  Windows_Server - The on-premises license is for Windows Server.
   *  Windows_Client - The on-premises license is for Windows Client.
   *
   */
  licenseType?: string;
  /** If specified, setup is performed on each node in the pool to allow tasks to run in containers. All regular tasks and job manager tasks run on this pool must specify the containerSettings property, and all other tasks may specify it. */
  containerConfiguration?: ContainerConfiguration;
  /** If specified, encryption is performed on each node in the pool during node provisioning. */
  diskEncryptionConfiguration?: DiskEncryptionConfiguration;
  /** This configuration will specify rules on how nodes in the pool will be physically allocated. */
  nodePlacementConfiguration?: NodePlacementConfiguration;
  /** If specified, the extensions mentioned in this configuration will be installed on each node. */
  extensions?: Array<VMExtension>;
  /** Contains configuration for ephemeral OSDisk settings. */
  osDisk?: OSDisk;
  /** Specifies the security profile settings for the virtual machine or virtual machine scale set. */
  securityProfile?: SecurityProfile;
  /** The service artifact reference id in the form of /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.Compute/galleries/{galleryName}/serviceArtifacts/{serviceArtifactName}/vmArtifactsProfiles/{vmArtifactsProfilesName} */
  serviceArtifactReference?: ServiceArtifactReference;
}

/** A reference to an Azure Virtual Machines Marketplace image or the Azure Image resource of a custom Virtual Machine. To get the list of all imageReferences verified by Azure Batch, see the 'List supported node agent SKUs' operation. */
export interface ImageReference {
  /** For example, Canonical or MicrosoftWindowsServer. */
  publisher?: string;
  /** For example, UbuntuServer or WindowsServer. */
  offer?: string;
  /** For example, 18.04-LTS or 2022-datacenter. */
  sku?: string;
  /** A value of 'latest' can be specified to select the latest version of an image. If omitted, the default is 'latest'. */
  version?: string;
  /** This property is mutually exclusive with other properties. The Azure Compute Gallery Image must have replicas in the same region as the Azure Batch account. For information about the firewall settings for the Batch node agent to communicate with the Batch service see https://learn.microsoft.com/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration. */
  id?: string;
  /** This property is mutually exclusive with other properties and can be fetched from shared gallery image GET call. */
  sharedGalleryImageId?: string;
  /** This property is mutually exclusive with other properties and can be fetched from community gallery image GET call. */
  communityGalleryImageId?: string;
}

/** Windows operating system settings to apply to the virtual machine. */
export interface WindowsConfiguration {
  /** If omitted, the default value is true. */
  enableAutomaticUpdates?: boolean;
}

/** Settings which will be used by the data disks associated to Compute Nodes in the Pool. When using attached data disks, you need to mount and format the disks from within a VM to use them. */
export interface DataDisk {
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
  storageAccountType?: "Standard_LRS" | "Premium_LRS" | "StandardSSD_LRS";
}

/** The configuration for container-enabled pools. */
export interface ContainerConfiguration {
  /** The container technology to be used. */
  type: "DockerCompatible" | "CriCompatible";
  /** This is the full image reference, as would be specified to "docker pull". An image will be sourced from the default Docker registry unless the image is fully qualified with an alternative registry. */
  containerImageNames?: Array<string>;
  /** If any images must be downloaded from a private registry which requires credentials, then those credentials must be provided here. */
  containerRegistries?: Array<ContainerRegistry>;
}

/** A private container registry. */
export interface ContainerRegistry {
  /** The user name to log into the registry server. */
  username?: string;
  /** The password to log into the registry server. */
  password?: string;
  /** If omitted, the default is "docker.io". */
  registryServer?: string;
  /** The reference to a user assigned identity associated with the Batch pool which a compute node will use. */
  identityReference?: ComputeNodeIdentityReference;
}

/** The disk encryption configuration applied on compute nodes in the pool. Disk encryption configuration is not supported on Linux pool created with Virtual Machine Image or Azure Compute Gallery Image. */
export interface DiskEncryptionConfiguration {
  /** On Linux pool, only "TemporaryDisk" is supported; on Windows pool, "OsDisk" and "TemporaryDisk" must be specified. */
  targets?: Array<"OsDisk" | "TemporaryDisk">;
}

/** Allocation configuration used by Batch Service to provision the nodes. */
export interface NodePlacementConfiguration {
  /** Allocation policy used by Batch Service to provision the nodes. If not specified, Batch will use the regional policy. */
  policy?: "Regional" | "Zonal";
}

/** The configuration for virtual machine extensions. */
export interface VMExtension {
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
export interface OSDisk {
  /** Specifies the ephemeral Disk Settings for the operating system disk used by the virtual machine. */
  ephemeralOSDiskSettings?: DiffDiskSettings;
  /** The type of caching to enable for the disk. */
  caching?: "None" | "ReadOnly" | "ReadWrite";
  managedDisk?: ManagedDisk;
  /** The initial disk size in GB when creating new OS disk. */
  diskSizeGB?: number;
  /** Specifies whether writeAccelerator should be enabled or disabled on the disk. */
  writeAcceleratorEnabled?: boolean;
}

/** Specifies the ephemeral Disk Settings for the operating system disk used by the virtual machine. */
export interface DiffDiskSettings {
  /** This property can be used by user in the request to choose which location the operating system should be in. e.g., cache disk space for Ephemeral OS disk provisioning. For more information on Ephemeral OS disk size requirements, please refer to Ephemeral OS disk size requirements for Windows VMs at https://learn.microsoft.com/azure/virtual-machines/windows/ephemeral-os-disks#size-requirements and Linux VMs at https://learn.microsoft.com/azure/virtual-machines/linux/ephemeral-os-disks#size-requirements. */
  placement?: "CacheDisk";
}

export interface ManagedDisk {
  /** The storage account type for use in creating data disks or OS disk. */
  storageAccountType?: "Standard_LRS" | "Premium_LRS" | "StandardSSD_LRS";
  /** Specifies the security profile settings for the managed disk. **Note**: It can only be set for Confidential VMs and is required when using Confidential VMs. */
  securityProfile?: VMDiskSecurityProfile;
}

/** Specifies the security profile settings for the managed disk. **Note**: It can only be set for Confidential VMs and is required when using Confidential VMs. */
export interface VMDiskSecurityProfile {
  /** Specifies the EncryptionType of the managed disk. It is set to VMGuestStateOnly for encryption of just the VMGuestState blob, and NonPersistedTPM for not persisting firmware state in the VMGuestState blob. **Note**: It can be set for only Confidential VMs and required when using Confidential VMs. */
  securityEncryptionType?: "NonPersistedTPM" | "VMGuestStateOnly";
}

/** Specifies the security profile settings for the virtual machine or virtual machine scale set. */
export interface SecurityProfile {
  /** Specifies the SecurityType of the virtual machine. It has to be set to any specified value to enable UefiSettings. */
  securityType?: "trustedLaunch" | "confidentialVM";
  /** This property can be used by user in the request to enable or disable the Host Encryption for the virtual machine or virtual machine scale set. This will enable the encryption for all the disks including Resource/Temp disk at host itself. */
  encryptionAtHost?: boolean;
  /** Specifies the security settings like secure boot and vTPM used while creating the virtual machine. */
  uefiSettings?: UefiSettings;
}

/** Specifies the security settings like secure boot and vTPM used while creating the virtual machine. */
export interface UefiSettings {
  /** Specifies whether secure boot should be enabled on the virtual machine. */
  secureBootEnabled?: boolean;
  /** Specifies whether vTPM should be enabled on the virtual machine. */
  vTpmEnabled?: boolean;
}

/** Specifies the service artifact reference id used to set same image version for all virtual machines in the scale set when using 'latest' image version. */
export interface ServiceArtifactReference {
  /** The service artifact reference id in the form of /subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.Compute/galleries/{galleryName}/serviceArtifacts/{serviceArtifactName}/vmArtifactsProfiles/{vmArtifactsProfilesName} */
  id: string;
}

/** Defines the desired size of the pool. This can either be 'fixedScale' where the requested targetDedicatedNodes is specified, or 'autoScale' which defines a formula which is periodically reevaluated. If this property is not specified, the pool will have a fixed scale with 0 targetDedicatedNodes. */
export interface ScaleSettings {
  /** This property and autoScale are mutually exclusive and one of the properties must be specified. */
  fixedScale?: FixedScaleSettings;
  /** This property and fixedScale are mutually exclusive and one of the properties must be specified. */
  autoScale?: AutoScaleSettings;
}

/** Fixed scale settings for the pool. */
export interface FixedScaleSettings {
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
export interface AutoScaleSettings {
  /** A formula for the desired number of compute nodes in the pool. */
  formula: string;
  /** If omitted, the default value is 15 minutes (PT15M). */
  evaluationInterval?: string;
}

/** The results and errors from an execution of a pool autoscale formula. */
export interface AutoScaleRun {
  /** The time at which the autoscale formula was last evaluated. */
  evaluationTime: Date | string;
  /** Each variable value is returned in the form $variable=value, and variables are separated by semicolons. */
  results?: string;
  /** An error that occurred when autoscaling a pool. */
  error?: AutoScaleRunError;
}

/** An error that occurred when autoscaling a pool. */
export interface AutoScaleRunError {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message: string;
  /** Additional details about the error. */
  details?: Array<AutoScaleRunError>;
}

/** The network configuration for a pool. */
export interface NetworkConfiguration {
  /** The virtual network must be in the same region and subscription as the Azure Batch account. The specified subnet should have enough free IP addresses to accommodate the number of nodes in the pool. If the subnet doesn't have enough free IP addresses, the pool will partially allocate compute nodes and a resize error will occur. The 'MicrosoftAzureBatch' service principal must have the 'Classic Virtual Machine Contributor' Role-Based Access Control (RBAC) role for the specified VNet. The specified subnet must allow communication from the Azure Batch service to be able to schedule tasks on the compute nodes. This can be verified by checking if the specified VNet has any associated Network Security Groups (NSG). If communication to the compute nodes in the specified subnet is denied by an NSG, then the Batch service will set the state of the compute nodes to unusable. If the specified VNet has any associated Network Security Groups (NSG), then a few reserved system ports must be enabled for inbound communication，including ports 29876 and 29877. Also enable outbound connections to Azure Storage on port 443. For more details see: https://learn.microsoft.com/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration */
  subnetId?: string;
  /** The scope of dynamic vnet assignment. */
  dynamicVnetAssignmentScope?: "none" | "job";
  /** The endpoint configuration for a pool. */
  endpointConfiguration?: PoolEndpointConfiguration;
  /** The public IP Address configuration of the networking configuration of a Pool. */
  publicIPAddressConfiguration?: PublicIPAddressConfiguration;
  /** Accelerated networking enables single root I/O virtualization (SR-IOV) to a VM, which may lead to improved networking performance. For more details, see: https://learn.microsoft.com/azure/virtual-network/accelerated-networking-overview. */
  enableAcceleratedNetworking?: boolean;
}

/** The endpoint configuration for a pool. */
export interface PoolEndpointConfiguration {
  /** The maximum number of inbound NAT pools per Batch pool is 5. If the maximum number of inbound NAT pools is exceeded the request fails with HTTP status code 400. This cannot be specified if the IPAddressProvisioningType is NoPublicIPAddresses. */
  inboundNatPools: Array<InboundNatPool>;
}

/** A inbound NAT pool that can be used to address specific ports on compute nodes in a Batch pool externally. */
export interface InboundNatPool {
  /** The name must be unique within a Batch pool, can contain letters, numbers, underscores, periods, and hyphens. Names must start with a letter or number, must end with a letter, number, or underscore, and cannot exceed 77 characters.  If any invalid values are provided the request fails with HTTP status code 400. */
  name: string;
  /** The protocol of the endpoint. */
  protocol: "TCP" | "UDP";
  /** This must be unique within a Batch pool. Acceptable values are between 1 and 65535 except for 29876 and 29877 as these are reserved. If any reserved values are provided the request fails with HTTP status code 400. */
  backendPort: number;
  /** Acceptable values range between 1 and 65534 except ports from 50000 to 55000 which are reserved. All ranges within a pool must be distinct and cannot overlap. If any reserved or overlapping values are provided the request fails with HTTP status code 400. */
  frontendPortRangeStart: number;
  /** Acceptable values range between 1 and 65534 except ports from 50000 to 55000 which are reserved by the Batch service. All ranges within a pool must be distinct and cannot overlap. If any reserved or overlapping values are provided the request fails with HTTP status code 400. */
  frontendPortRangeEnd: number;
  /** The maximum number of rules that can be specified across all the endpoints on a Batch pool is 25. If no network security group rules are specified, a default rule will be created to allow inbound access to the specified backendPort. If the maximum number of network security group rules is exceeded the request fails with HTTP status code 400. */
  networkSecurityGroupRules?: Array<NetworkSecurityGroupRule>;
}

/** A network security group rule to apply to an inbound endpoint. */
export interface NetworkSecurityGroupRule {
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
export interface PublicIPAddressConfiguration {
  /** The default value is BatchManaged */
  provision?: "BatchManaged" | "UserManaged" | "NoPublicIPAddresses";
  /** The number of IPs specified here limits the maximum size of the Pool - 100 dedicated nodes or 100 Spot/low-priority nodes can be allocated for each public IP. For example, a pool needing 250 dedicated VMs would need at least 3 public IPs specified. Each element of this collection is of the form: /subscriptions/{subscription}/resourceGroups/{group}/providers/Microsoft.Network/publicIPAddresses/{ip}. */
  ipAddressIds?: Array<string>;
}

/** Specifies how tasks should be distributed across compute nodes. */
export interface TaskSchedulingPolicy {
  /** How tasks should be distributed across compute nodes. */
  nodeFillType: "Spread" | "Pack";
}

/** Properties used to create a user on an Azure Batch node. */
export interface UserAccount {
  /** The name of the user account. Names can contain any Unicode characters up to a maximum length of 20. */
  name: string;
  /** The password for the user account. */
  password: string;
  /** nonAdmin - The auto user is a standard user without elevated access. admin - The auto user is a user with elevated access and operates with full Administrator permissions. The default value is nonAdmin. */
  elevationLevel?: "NonAdmin" | "Admin";
  /** This property is ignored if specified on a Windows pool. If not specified, the user is created with the default options. */
  linuxUserConfiguration?: LinuxUserConfiguration;
  /** This property can only be specified if the user is on a Windows pool. If not specified and on a Windows pool, the user is created with the default options. */
  windowsUserConfiguration?: WindowsUserConfiguration;
}

/** Properties used to create a user account on a Linux node. */
export interface LinuxUserConfiguration {
  /** The uid and gid properties must be specified together or not at all. If not specified the underlying operating system picks the uid. */
  uid?: number;
  /** The uid and gid properties must be specified together or not at all. If not specified the underlying operating system picks the gid. */
  gid?: number;
  /** The private key must not be password protected. The private key is used to automatically configure asymmetric-key based authentication for SSH between nodes in a Linux pool when the pool's enableInterNodeCommunication property is true (it is ignored if enableInterNodeCommunication is false). It does this by placing the key pair into the user's .ssh directory. If not specified, password-less SSH is not configured between nodes (no modification of the user's .ssh directory is done). */
  sshPrivateKey?: string;
}

/** Properties used to create a user account on a Windows node. */
export interface WindowsUserConfiguration {
  /** Specifies login mode for the user. The default value is Interactive. */
  loginMode?: "Batch" | "Interactive";
}

/** The Batch service does not assign any meaning to this metadata; it is solely for the use of user code. */
export interface MetadataItem {
  /** The name of the metadata item. */
  name: string;
  /** The value of the metadata item. */
  value: string;
}

/** In some cases the start task may be re-run even though the node was not rebooted. Due to this, start tasks should be idempotent and exit gracefully if the setup they're performing has already been done. Special care should be taken to avoid start tasks which create breakaway process or install/launch services from the start task working directory, as this will block Batch from being able to re-run the start task. */
export interface StartTask {
  /** The command line does not run under a shell, and therefore cannot take advantage of shell features such as environment variable expansion. If you want to take advantage of such features, you should invoke the shell in the command line, for example using "cmd /c MyCommand" in Windows or "/bin/sh -c MyCommand" in Linux. Required if any other properties of the startTask are specified. */
  commandLine?: string;
  /** A list of files that the Batch service will download to the compute node before running the command line. */
  resourceFiles?: Array<ResourceFile>;
  /** A list of environment variable settings for the start task. */
  environmentSettings?: Array<EnvironmentSetting>;
  /** If omitted, the task runs as a non-administrative user unique to the task. */
  userIdentity?: UserIdentity;
  /** The Batch service retries a task if its exit code is nonzero. Note that this value specifically controls the number of retries. The Batch service will try the task once, and may then retry up to this limit. For example, if the maximum retry count is 3, Batch tries the task up to 4 times (one initial try and 3 retries). If the maximum retry count is 0, the Batch service does not retry the task. If the maximum retry count is -1, the Batch service retries the task without limit. Default is 0 */
  maxTaskRetryCount?: number;
  /** If true and the start task fails on a compute node, the Batch service retries the start task up to its maximum retry count (maxTaskRetryCount). If the task has still not completed successfully after all retries, then the Batch service marks the compute node unusable, and will not schedule tasks to it. This condition can be detected via the node state and scheduling error detail. If false, the Batch service will not wait for the start task to complete. In this case, other tasks can start executing on the compute node while the start task is still running; and even if the start task fails, new tasks will continue to be scheduled on the node. The default is true. */
  waitForSuccess?: boolean;
  /** When this is specified, all directories recursively below the AZ_BATCH_NODE_ROOT_DIR (the root of Azure Batch directories on the node) are mapped into the container, all task environment variables are mapped into the container, and the task command line is executed in the container. */
  containerSettings?: TaskContainerSettings;
}

/** A single file or multiple files to be downloaded to a compute node. */
export interface ResourceFile {
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
  identityReference?: ComputeNodeIdentityReference;
}

/** An environment variable to be set on a task process. */
export interface EnvironmentSetting {
  /** The name of the environment variable. */
  name: string;
  /** The value of the environment variable. */
  value?: string;
}

/** Specify either the userName or autoUser property, but not both. */
export interface UserIdentity {
  /** The userName and autoUser properties are mutually exclusive; you must specify one but not both. */
  userName?: string;
  /** The userName and autoUser properties are mutually exclusive; you must specify one but not both. */
  autoUser?: AutoUserSpecification;
}

/** Specifies the parameters for the auto user that runs a task on the Batch service. */
export interface AutoUserSpecification {
  /** The default value is Pool. If the pool is running Windows a value of Task should be specified if stricter isolation between tasks is required. For example, if the task mutates the registry in a way which could impact other tasks, or if certificates have been specified on the pool which should not be accessible by normal tasks but should be accessible by start tasks. */
  scope?: "Task" | "Pool";
  /** The default value is nonAdmin. */
  elevationLevel?: "NonAdmin" | "Admin";
}

/** The container settings for a task. */
export interface TaskContainerSettings {
  /** These additional options are supplied as arguments to the "docker create" command, in addition to those controlled by the Batch Service. */
  containerRunOptions?: string;
  /** This is the full image reference, as would be specified to "docker pull". If no tag is provided as part of the image name, the tag ":latest" is used as a default. */
  imageName: string;
  /** This setting can be omitted if was already provided at pool creation. */
  registry?: ContainerRegistry;
  /** A flag to indicate where the container task working directory is. The default is 'taskWorkingDirectory'. */
  workingDirectory?: "TaskWorkingDirectory" | "ContainerImageDefault";
  /** If this array is null or be not present, container task will mount entire temporary disk drive in windows (or AZ_BATCH_NODE_ROOT_DIR in Linux). It won't' mount any data paths into container if this array is set as empty. */
  containerHostBatchBindMounts?: Array<ContainerHostBatchBindMountEntry>;
}

/** The entry of path and mount mode you want to mount into task container. */
export interface ContainerHostBatchBindMountEntry {
  /** The paths which will be mounted to container task's container. */
  source?:
    | "Shared"
    | "Startup"
    | "VfsMounts"
    | "Task"
    | "JobPrep"
    | "Applications";
  /** For Linux, if you mount this path as a read/write mode, this does not mean that all users in container have the read/write access for the path, it depends on the access in host VM. If this path is mounted read-only, all users within the container will not be able to modify the path. */
  isReadOnly?: boolean;
}

/** Warning: This object is deprecated and will be removed after February, 2024. Please use the [Azure KeyVault Extension](https://learn.microsoft.com/azure/batch/batch-certificate-migration-guide) instead. */
export interface CertificateReference {
  /** The fully qualified ID of the certificate to install on the pool. This must be inside the same batch account as the pool. */
  id: string;
  /** The default value is currentUser. This property is applicable only for pools configured with Windows compute nodes. For Linux compute nodes, the certificates are stored in a directory inside the task working directory and an environment variable AZ_BATCH_CERTIFICATES_DIR is supplied to the task to query for this location. For certificates with visibility of 'remoteUser', a 'certs' directory is created in the user's home directory (e.g., /home/{user-name}/certs) and certificates are placed in that directory. */
  storeLocation?: "CurrentUser" | "LocalMachine";
  /** This property is applicable only for pools configured with Windows compute nodes. Common store names include: My, Root, CA, Trust, Disallowed, TrustedPeople, TrustedPublisher, AuthRoot, AddressBook, but any custom store name can also be used. The default value is My. */
  storeName?: string;
  /** Which user accounts on the compute node should have access to the private data of the certificate. */
  visibility?: Array<"StartTask" | "Task" | "RemoteUser">;
}

/** Link to an application package inside the batch account */
export interface ApplicationPackageReference {
  /** The ID of the application package to install. This must be inside the same batch account as the pool. This can either be a reference to a specific version or the default version if one exists. */
  id: string;
  /** If this is omitted, and no default version is specified for this application, the request fails with the error code InvalidApplicationPackageReferences. If you are calling the REST API directly, the HTTP status code is 409. */
  version?: string;
}

/** Describes either the current operation (if the pool AllocationState is Resizing) or the previously completed operation (if the AllocationState is Steady). */
export interface ResizeOperationStatus {
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
  startTime?: Date | string;
  /** This property is set only if an error occurred during the last pool resize, and only when the pool allocationState is Steady. */
  errors?: Array<ResizeError>;
}

/** An error that occurred when resizing a pool. */
export interface ResizeError {
  /** An identifier for the error. Codes are invariant and are intended to be consumed programmatically. */
  code: string;
  /** A message describing the error, intended to be suitable for display in a user interface. */
  message: string;
  /** Additional details about the error. */
  details?: Array<ResizeError>;
}

/** The file system to mount on each node. */
export interface MountConfiguration {
  /** This property is mutually exclusive with all other properties. */
  azureBlobFileSystemConfiguration?: AzureBlobFileSystemConfiguration;
  /** This property is mutually exclusive with all other properties. */
  nfsMountConfiguration?: NFSMountConfiguration;
  /** This property is mutually exclusive with all other properties. */
  cifsMountConfiguration?: CifsMountConfiguration;
  /** This property is mutually exclusive with all other properties. */
  azureFileShareConfiguration?: AzureFileShareConfiguration;
}

/** Information used to connect to an Azure Storage Container using Blobfuse. */
export interface AzureBlobFileSystemConfiguration {
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
  identityReference?: ComputeNodeIdentityReference;
}

/** Information used to connect to an NFS file system. */
export interface NFSMountConfiguration {
  /** The URI of the file system to mount. */
  source: string;
  /** All file systems are mounted relative to the Batch mounts directory, accessible via the AZ_BATCH_NODE_MOUNTS_DIR environment variable. */
  relativeMountPath: string;
  /** These are 'net use' options in Windows and 'mount' options in Linux. */
  mountOptions?: string;
}

/** Information used to connect to a CIFS file system. */
export interface CifsMountConfiguration {
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
export interface AzureFileShareConfiguration {
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

/** Describes an upgrade policy - automatic, manual, or rolling. */
export interface UpgradePolicy {
  /** Specifies the mode of an upgrade to virtual machines in the scale set.<br /><br /> Possible values are:<br /><br /> **Manual** - You  control the application of updates to virtual machines in the scale set. You do this by using the manualUpgrade action.<br /><br /> **Automatic** - All virtual machines in the scale set are automatically updated at the same time.<br /><br /> **Rolling** - Scale set performs updates in batches with an optional pause time in between. */
  mode: "automatic" | "manual" | "rolling";
  /** The configuration parameters used for performing automatic OS upgrade. */
  automaticOSUpgradePolicy?: AutomaticOSUpgradePolicy;
  /** The configuration parameters used while performing a rolling upgrade. */
  rollingUpgradePolicy?: RollingUpgradePolicy;
}

/** The configuration parameters used for performing automatic OS upgrade. */
export interface AutomaticOSUpgradePolicy {
  /** Whether OS image rollback feature should be disabled. */
  disableAutomaticRollback?: boolean;
  /** Indicates whether OS upgrades should automatically be applied to scale set instances in a rolling fashion when a newer version of the OS image becomes available. <br /><br /> If this is set to true for Windows based pools, [WindowsConfiguration.enableAutomaticUpdates](https://learn.microsoft.com/rest/api/batchmanagement/pool/create?tabs=HTTP#windowsconfiguration) cannot be set to true. */
  enableAutomaticOSUpgrade?: boolean;
  /** Indicates whether rolling upgrade policy should be used during Auto OS Upgrade. Auto OS Upgrade will fallback to the default policy if no policy is defined on the VMSS. */
  useRollingUpgradePolicy?: boolean;
  /** Defer OS upgrades on the TVMs if they are running tasks. */
  osRollingUpgradeDeferral?: boolean;
}

/** The configuration parameters used while performing a rolling upgrade. */
export interface RollingUpgradePolicy {
  /** Allow VMSS to ignore AZ boundaries when constructing upgrade batches. Take into consideration the Update Domain and maxBatchInstancePercent to determine the batch size. If this field is not set, Azure Azure Batch will not set its default value. The value of enableCrossZoneUpgrade on the created VirtualMachineScaleSet will be decided by the default configurations on VirtualMachineScaleSet. This field is able to be set to true or false only when using NodePlacementConfiguration as Zonal. */
  enableCrossZoneUpgrade?: boolean;
  /** The maximum percent of total virtual machine instances that will be upgraded simultaneously by the rolling upgrade in one batch. As this is a maximum, unhealthy instances in previous or future batches can cause the percentage of instances in a batch to decrease to ensure higher reliability. The value of this field should be between 5 and 100, inclusive. If both maxBatchInstancePercent and maxUnhealthyInstancePercent are assigned with value, the value of maxBatchInstancePercent should not be more than maxUnhealthyInstancePercent. */
  maxBatchInstancePercent?: number;
  /** The maximum percentage of the total virtual machine instances in the scale set that can be simultaneously unhealthy, either as a result of being upgraded, or by being found in an unhealthy state by the virtual machine health checks before the rolling upgrade aborts. This constraint will be checked prior to starting any batch. The value of this field should be between 5 and 100, inclusive. If both maxBatchInstancePercent and maxUnhealthyInstancePercent are assigned with value, the value of maxBatchInstancePercent should not be more than maxUnhealthyInstancePercent. */
  maxUnhealthyInstancePercent?: number;
  /** The maximum percentage of upgraded virtual machine instances that can be found to be in an unhealthy state. This check will happen after each batch is upgraded. If this percentage is ever exceeded, the rolling update aborts. The value of this field should be between 0 and 100, inclusive. */
  maxUnhealthyUpgradedInstancePercent?: number;
  /** The wait time between completing the update for all virtual machines in one batch and starting the next batch. The time duration should be specified in ISO 8601 format. */
  pauseTimeBetweenBatches?: string;
  /** Upgrade all unhealthy instances in a scale set before any healthy instances. */
  prioritizeUnhealthyInstances?: boolean;
  /** Rollback failed instances to previous model if the Rolling Upgrade policy is violated. */
  rollbackFailedInstancesOnPolicyBreach?: boolean;
}

/** The identity of the Batch pool, if configured. If the pool identity is updated during update an existing pool, only the new vms which are created after the pool shrinks to 0 will have the updated identities */
export interface BatchPoolIdentity {
  /** The type of identity used for the Batch Pool. */
  type: "UserAssigned" | "None";
  /** The list of user identities associated with the Batch pool. */
  userAssignedIdentities?: Record<string, UserAssignedIdentities>;
}
