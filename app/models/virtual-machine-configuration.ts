import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { DataDisk } from "./azure-batch/data-disk";
import { PoolOSDisk, PoolOSDiskAttributes } from "./azure-batch/pool/pool-os-disk";
import { ContainerConfiguration, ContainerConfigurationAttributes } from "./container-setup";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";
import { WindowsConfiguration } from "./windows-configuration";

export interface VirtualMachineConfigurationAttributes {
    imageReference: ImageReferenceAttributes;
    nodeAgentSKUId: string;
    windowsConfiguration: WindowsConfiguration;
    osDisk?: PoolOSDiskAttributes;
    containerConfiguration: ContainerConfigurationAttributes;
}

/**
 * Class for displaying Batch VirtualMachineConfiguration information.
 */
@Model()
export class VirtualMachineConfiguration extends Record<VirtualMachineConfigurationAttributes> {
    @Prop() public imageReference: ImageReference;
    @Prop() public nodeAgentSKUId: string;
    @Prop() public windowsConfiguration: WindowsConfiguration;
    @Prop() public osDisk: PoolOSDisk;
    @Prop() public containerConfiguration: ContainerConfiguration;
    @Prop() public licenseType: string;
    @ListProp(DataDisk) public dataDisks: List<DataDisk>;
}
