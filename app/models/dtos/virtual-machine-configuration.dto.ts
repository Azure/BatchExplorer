import { Dto, DtoAttr } from "@batch-flask/core";
import { ContainerConfiguration } from "./container-setup.dto";

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
    public containerConfiguration: ContainerConfiguration;

    @DtoAttr()
    public windowsConfiguration?: {
        enableAutomaticUpdates?: boolean;
    };
}
