import { Model, Prop, Record } from "app/core";
import { ImageReference, ImageReferenceAttributes } from "./image-reference";
import { PoolOSDisk, PoolOSDiskAttributes } from "./pool-os-disk";
import { WindowsConfiguration } from "./windows-configuration";

export interface VirtualMachineConfigurationAttributes {
    imageReference: ImageReferenceAttributes;
    nodeAgentSKUId: string;
    windowsConfiguration: WindowsConfiguration;
    osDisk?: PoolOSDiskAttributes;
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
}
