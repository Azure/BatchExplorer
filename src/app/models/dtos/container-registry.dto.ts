import { Dto, DtoAttr } from "@batch-flask/core";

export class ContainerRegistryDto extends Dto<ContainerRegistryDto> {
    @DtoAttr() public username: string;
    @DtoAttr() public password: string;
    @DtoAttr() public registryServer: string;
}
