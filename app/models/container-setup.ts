import { Model, Prop, Record } from "@batch-flask/core";

export enum ContainerType {
    Docker = "docker",
}

export interface ContainerConfigurationAttributes {
    containerImageNames: string[];
    containerRegistries: ContainerRegistryAttributes[];
    type: ContainerType;
}

export interface ContainerRegistryAttributes {
    userName: string;
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
    @Prop() public userName: string;
    @Prop() public password: string;
    @Prop() public registryServer: string;
}

@Model()
export class TaskContainerSettings extends Record<TaskContainerSettingsAttributes> {
    @Prop() public imageName: string;
    @Prop() public containerRunOptions: string;
    @Prop() public registry: ContainerRegistry;
}

@Model()
export class ContainerConfiguration extends Record<ContainerConfigurationAttributes> {
    @Prop() public containerImageNames: string[];
    @Prop() public containerRegistries: ContainerRegistry[];
    @Prop() public type: ContainerType;
}
