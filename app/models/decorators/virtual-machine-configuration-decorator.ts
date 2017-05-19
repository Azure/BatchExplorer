import { VirtualMachineConfiguration } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ImageReferenceDecorator } from "./image-reference-decorator";
import { WindowsConfigurationDecorator } from "./windows-configuration-decorator";

export class VirtualMachineConfigurationDecorator extends DecoratorBase<VirtualMachineConfiguration> {
    public imageReference: ImageReferenceDecorator;
    public nodeAgentSKUId: string;
    public windowsConfiguration: WindowsConfigurationDecorator;

    constructor(virtualMachieConfiguration: VirtualMachineConfiguration) {
        super(virtualMachieConfiguration);

        this.imageReference = new ImageReferenceDecorator(
            virtualMachieConfiguration.imageReference || {} as any);
        this.nodeAgentSKUId = this.stringField(
            virtualMachieConfiguration.nodeAgentSKUId);
        this.windowsConfiguration = new WindowsConfigurationDecorator(
            virtualMachieConfiguration.windowsConfiguration || {} as any);
    }
}
