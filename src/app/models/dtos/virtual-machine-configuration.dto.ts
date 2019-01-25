import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { CachingType, StorageAccountType } from "../azure-batch";
import { ContainerConfigurationDto } from "./container-setup.dto";

export class DataDiskDto extends Dto<ImageReferenceDto> {
    @DtoAttr() public caching: CachingType;
    @DtoAttr() public diskSizeGB: number;
    @DtoAttr() public lun: number;
    @DtoAttr() public storageAccountType: StorageAccountType;
}

export class ImageReferenceDto extends Dto<ImageReferenceDto> {
    @DtoAttr() public publisher: string;
    @DtoAttr() public offer: string;
    @DtoAttr() public sku: string;
    @DtoAttr() public version: string;
    @DtoAttr() public virtualMachineImageId: string;
}

export class WindowsConfigurationDto extends Dto<WindowsConfigurationDto>  {
    @DtoAttr() public enableAutomaticUpdates?: boolean;
}

export class VirtualMachineConfigurationDto extends Dto<VirtualMachineConfigurationDto> {
    @DtoAttr() public nodeAgentSKUId: string;

    @DtoAttr() public imageReference: ImageReferenceDto;

    @ListDtoAttr(DataDiskDto) public dataDisks: DataDiskDto[];

    @DtoAttr() public containerConfiguration: ContainerConfigurationDto;

    @DtoAttr() public windowsConfiguration?: {
        enableAutomaticUpdates?: boolean;
    };
}
