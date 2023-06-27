import { Dto, DtoAttr } from "@batch-flask/core";
import { ContainerType } from "../container-setup";
import { ContainerRegistryDto } from "./container-registry.dto";

export interface ContainerImage {
    imageName: string;
}

export class ContainerConfigurationDto extends Dto<ContainerConfigurationDto> {
    @DtoAttr() public containerImageNames: string[];
    @DtoAttr() public containerRegistries: ContainerRegistryDto[];
    @DtoAttr() public type: ContainerType;
}
