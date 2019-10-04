import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface AzureBlobFileSystemConfigurationAttributes {
    accountKey: string;
    accountName: string;
    blobfuseOptions: string;
    containerName: string;
    relativeMountPath: string;
    sasKey: string;
}

export interface AzureFileShareConfigurationAttributes {
    accountKey: string;
    accountName: string;
    azureFileUrl: string;
    mountOptions: string;
    relativeMountPath: string;
}

export interface CifsMountConfigurationAttributes {
    mountOptions: string;
    password: string;
    relativeMountPath: string;
    source: string;
    username: string;
}

export interface NfsMountConfigurationAttributes {
    mountOptions: string;
    relativeMountPath: string;
    source: string;
}

export interface MountConfigurationAttributes {
    azureBlobFileSystemConfiguration: AzureBlobFileSystemConfiguration;
    azureFileShareConfiguration: AzureFileShareConfiguration;
    cifsMountConfiguraiton: CifsMountConfiguration;
    nfsMountConfiguration: NfsMountConfiguration;
}

/**
 * Classes for configuring a file system mount
 */
@Model()
export class AzureBlobFileSystemConfiguration extends Record<AzureBlobFileSystemConfigurationAttributes> {
    @Prop() public accountKey: string;
    @Prop() public accountName: string;
    @Prop() public blobfuseOptions: string;
    @Prop() public containerName: string;
    @Prop() public relativeMountPath: string;
    @Prop() public sasKey: string;
}

@Model()
export class AzureFileShareConfiguration extends Record<AzureFileShareConfigurationAttributes> {
    @Prop() public accountKey: string;
    @Prop() public accountName: string;
    @Prop() public azureFileUrl: string;
    @Prop() public mountOptions: string;
    @Prop() public relativeMountPath: string;
}

@Model()
export class CifsMountConfiguration extends Record<CifsMountConfigurationAttributes> {
    @Prop() public mountOptions: string;
    @Prop() public password: string;
    @Prop() public relativeMountPath: string;
    @Prop() public source: string;
    @Prop() public username: string;
}

@Model()
export class NfsMountConfiguration extends Record<NfsMountConfigurationAttributes> {
    @Prop() public mountOptions: string;
    @Prop() public relativeMountPath: string;
    @Prop() public source: string;
}

@Model()
export class MountConfiguration extends Record<MountConfigurationAttributes> {
    @Prop() public azureBlobFileSystemConfiguration: AzureBlobFileSystemConfiguration;
    @Prop() public azureFileShareConfiguration: AzureFileShareConfiguration;
    @Prop() public cifsMountConfiguraiton: CifsMountConfiguration;
    @Prop() public nfsMountConfiguration: NfsMountConfiguration;
}
