import { ContainerType } from "../container-setup";

export interface ContainerImage {
    imageName: string;
}

export interface ContainerRegistry {
    username: string;
    password: string;
    registryServer: string;
}

export interface ContainerConfiguration {
    containerImageNames: string[];
    containerRegistries: ContainerRegistry[];
    type: ContainerType;
}

export interface TaskContainerSettings {
    containerRunOptions: string;
    imageName: string;
    registry: ContainerRegistry;
}
