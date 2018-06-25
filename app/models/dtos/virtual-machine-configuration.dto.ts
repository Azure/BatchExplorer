import { Dto, DtoAttr } from "@batch-flask/core";
import { ContainerConfigurationDto } from "./container-setup.dto";

export class VirtualMachineConfiguration extends Dto<VirtualMachineConfiguration> {
    @DtoAttr()
    public nodeAgentSKUId: string;

    @DtoAttr()
    public imageReference: {
        publisher: string;
        offer: string;
        sku: string;
        version?: string;
    };

    @DtoAttr()
    public containerConfiguration: ContainerConfigurationDto;

    @DtoAttr()
    public windowsConfiguration?: {
        enableAutomaticUpdates?: boolean;
    };
}
