import { Dto, DtoAttr } from "@batch-flask/core";
import { ContainerRegistryDto } from "./container-registry.dto";

export class TaskContainerSettingsDto extends Dto<TaskContainerSettingsDto> {
    @DtoAttr() public containerRunOptions: string;
    @DtoAttr() public imageName: string;
    @DtoAttr() public registry: ContainerRegistryDto;
}
