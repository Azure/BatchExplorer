import { Model, Prop, Record } from "@batch-flask/core";
import { ContainerConfiguration } from "./container-setup";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";
import { PoolOSDisk, PoolOSDiskAttributes } from "./pool-os-disk";
import { WindowsConfiguration } from "./windows-configuration";

export interface VirtualMachineConfigurationAttributes {
    imageReference: ImageReferenceAttributes;
    nodeAgentSKUId: string;
    windowsConfiguration: WindowsConfiguration;
    osDisk?: PoolOSDiskAttributes;
    containerConfiguration: ContainerConfiguration;
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
}
