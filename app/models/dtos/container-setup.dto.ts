import { ContainerType } from "../container-setup";
import { ContainerRegistryDto } from "./container-registry.dto";

export interface ContainerImage {
    imageName: string;
}

export interface ContainerConfiguration {
    containerImageNames: string[];
    containerRegistries: ContainerRegistryDto[];
    type: ContainerType;
}
