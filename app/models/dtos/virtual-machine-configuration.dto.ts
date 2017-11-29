import { Dto, DtoAttr } from "app/core";
import { ContainerRegistry, ContainerType } from "./container-setup.dto";
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
    public containerConfiguration: {
        containerImageNames: string[];
        containerRegistries: ContainerRegistry[];
        type: ContainerType;
    };

    @DtoAttr()
    public windowsConfiguration?: {
        enableAutomaticUpdates?: boolean;
    };
}
