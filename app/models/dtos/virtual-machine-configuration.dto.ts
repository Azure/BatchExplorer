import { Dto, DtoAttr } from "@batch-flask/core";
import { ContainerConfigurationDto } from "./container-setup.dto";

export class ImageReferenceDto extends Dto<ImageReferenceDto> {
    @DtoAttr() public publisher: string;
    @DtoAttr() public offer: string;
    @DtoAttr() public sku: string;
    @DtoAttr() public version: string;
}

export class WindowsConfigurationDto extends Dto<WindowsConfigurationDto>  {
    @DtoAttr() public enableAutomaticUpdates?: boolean;
}

export class VirtualMachineConfigurationDto extends Dto<VirtualMachineConfigurationDto> {
    @DtoAttr() public nodeAgentSKUId: string;

    @DtoAttr() public imageReference: ImageReferenceDto;

    @DtoAttr() public containerConfiguration: ContainerConfigurationDto;

    @DtoAttr() public windowsConfiguration?: {
        enableAutomaticUpdates?: boolean;
    };
}
