import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { DataDisk } from "./azure-batch/data-disk";
import { ContainerConfiguration, ContainerConfigurationAttributes } from "./container-setup";
import { DiskEncryptionConfiguration, DiskEncryptionConfigurationAttributes } from "./disk-encryption-configuration";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";
import { WindowsConfiguration } from "./windows-configuration";

export interface VirtualMachineConfigurationAttributes {
    diskEncryptionConfiguration: DiskEncryptionConfigurationAttributes;
    imageReference: ImageReferenceAttributes;
    nodeAgentSKUId: string;
    windowsConfiguration: WindowsConfiguration;
    containerConfiguration: ContainerConfigurationAttributes;
}

/**
 * Class for displaying Batch virtual machine configuration information.
 */
@Model()
export class VirtualMachineConfiguration extends Record<VirtualMachineConfigurationAttributes> {
    @Prop() public diskEncryptionConfiguration: DiskEncryptionConfiguration;
    @Prop() public imageReference: ImageReference;
    @Prop() public nodeAgentSKUId: string;
    @Prop() public windowsConfiguration: WindowsConfiguration;
    @Prop() public containerConfiguration: ContainerConfiguration;
    @Prop() public licenseType: string;
    @ListProp(DataDisk) public dataDisks: List<DataDisk>;
}
