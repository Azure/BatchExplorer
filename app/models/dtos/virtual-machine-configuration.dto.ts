import { Dto, DtoAttr } from "app/core";

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
    public windowsConfiguration?: {
        enableAutomaticUpdates?: boolean;
    };
}
