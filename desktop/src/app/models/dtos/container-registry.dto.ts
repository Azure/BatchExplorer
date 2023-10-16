import { Dto, DtoAttr } from "@batch-flask/core";
import { ComputeNodeIdentityReference } from "../compute-node-identity-reference";

export class ContainerRegistryDto extends Dto<ContainerRegistryDto> {
    @DtoAttr() public username: string;
    @DtoAttr() public password: string;
    @DtoAttr() public registryServer: string;
    identityReference: ComputeNodeIdentityReference;
}
