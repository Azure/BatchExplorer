import { VirtualMachineConfiguration } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ImageReferenceDecorator, WindowsConfigurationDecorator } from "./";

export class VirtualMachineConfigurationDecorator extends DecoratorBase<VirtualMachineConfiguration> {
    public imageReference: ImageReferenceDecorator;
    public nodeAgentSKUId: string;
    public windowsConfiguration: WindowsConfigurationDecorator;

    constructor(private virtualMachieConfiguration: VirtualMachineConfiguration) {
        super(virtualMachieConfiguration);

        this.imageReference = new ImageReferenceDecorator(
            virtualMachieConfiguration.imageReference || <any>{});
        this.nodeAgentSKUId = this.stringField(
            virtualMachieConfiguration.nodeAgentSKUId);
        this.windowsConfiguration = new WindowsConfigurationDecorator(
            virtualMachieConfiguration.windowsConfiguration || <any>{});
    }
}
