import { Model, Prop, Record } from "app/core";

export interface ContainerRegistryAttributes {
    username: string;
    password: string;
    registryServer: string;
}

export interface TaskContainerSettingsAttributes {
    imageName: string;
    containerRunOptions: string;
    registry: ContainerRegistryAttributes;
}

@Model()
export class ContainerRegistry extends Record<ContainerRegistryAttributes> {
    @Prop() public username: string;
    @Prop() public password: string;
    @Prop() public registryServer: string;
}

@Model()
export class TaskContainerSettings extends Record<TaskContainerSettingsAttributes> {
    @Prop() public imageName: string;
    @Prop() public containerRunOptions: string;
    @Prop() public registry: ContainerRegistry;
}
