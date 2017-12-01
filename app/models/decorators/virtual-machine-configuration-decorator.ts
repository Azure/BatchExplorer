import { VirtualMachineConfiguration } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { ContainerConfigurationDecorator } from "./container-configuration-decorator";
import { ImageReferenceDecorator } from "./image-reference-decorator";
import { WindowsConfigurationDecorator } from "./windows-configuration-decorator";

export class VirtualMachineConfigurationDecorator extends DecoratorBase<VirtualMachineConfiguration> {
    public imageReference: ImageReferenceDecorator;
    public nodeAgentSKUId: string;
    public windowsConfiguration: WindowsConfigurationDecorator;
    public containerConfiguration: ContainerConfigurationDecorator;

    constructor(virtualMachieConfiguration: VirtualMachineConfiguration, osName: string) {
        super(virtualMachieConfiguration);

        this.imageReference = new ImageReferenceDecorator(
            virtualMachieConfiguration.imageReference || {} as any);
        this.nodeAgentSKUId = this.stringField(
            virtualMachieConfiguration.nodeAgentSKUId);
        this.windowsConfiguration = new WindowsConfigurationDecorator(
            virtualMachieConfiguration.windowsConfiguration || {} as any);
        if (virtualMachieConfiguration.containerConfiguration) {
            this.containerConfiguration = new ContainerConfigurationDecorator(
                virtualMachieConfiguration.containerConfiguration);
        }
    }
}
