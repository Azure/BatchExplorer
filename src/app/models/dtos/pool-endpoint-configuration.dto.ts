import { Dto, DtoAttr, ListDtoAttr } from "@batch-flask/core";
import { InboundEndpointProtocol, NetworkSecurityGroupRuleAccess } from "app/models/pool-endpoint-configuration";

export class NetworkSecurityGroupRuleDto extends Dto<NetworkSecurityGroupRuleDto> {
    @DtoAttr() public access: NetworkSecurityGroupRuleAccess;
    @DtoAttr() public priority: number;
    @DtoAttr() public sourceAddressPrefix: string;
}

export class InboundNATPoolDto extends Dto<InboundNATPoolDto> {
    @DtoAttr() public backendPort: number;
    @DtoAttr() public frontendPortRangeEnd: number;
    @DtoAttr() public frontendPortRangeStart: number;
    @DtoAttr() public name: string;
    @ListDtoAttr(NetworkSecurityGroupRuleDto) public networkSecurityGroupRules: NetworkSecurityGroupRuleDto[];
    @DtoAttr() public protocol: InboundEndpointProtocol;
}

export class PoolEndPointConfigurationDto extends Dto<PoolEndPointConfigurationDto> {
    @ListDtoAttr(InboundNATPoolDto) public inboundNATPools: InboundNATPoolDto[];
}
