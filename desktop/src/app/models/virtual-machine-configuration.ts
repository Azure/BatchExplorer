import { ListProp, Model, Prop, Record } from "@batch-flask/core/record";
import { List } from "immutable";
import { DataDisk } from "./azure-batch/data-disk";
import { ContainerConfiguration, ContainerConfigurationAttributes } from "./container-setup";
import { DiskEncryptionConfiguration, DiskEncryptionConfigurationAttributes } from "./disk-encryption-configuration";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";
import { WindowsConfiguration } from "./windows-configuration";
import { NodePlacementConfiguration } from "./node-placement-configuration";
import { VMExtension } from "./vm-extension";
import { OSDisk } from "./os-disk";

export interface VirtualMachineConfigurationAttributes {
    diskEncryptionConfiguration: DiskEncryptionConfigurationAttributes;
    imageReference: ImageReferenceAttributes;
    nodeAgentSKUId: string;
    windowsConfiguration: WindowsConfiguration;
    containerConfiguration: ContainerConfigurationAttributes;
    nodePlacementConfiguration: NodePlacementConfiguration;
    extensions: List<VMExtension>;
    osDisk: OSDisk;
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
    @Prop() public nodePlacementConfiguration: NodePlacementConfiguration;
    @Prop() public licenseType: string;
    @Prop() public osDisk: OSDisk;
    @ListProp(DataDisk) public dataDisks: List<DataDisk>;
    @ListProp(VMExtension) public extensions: List<VMExtension>;
}
