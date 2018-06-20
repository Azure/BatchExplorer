import { Dto, DtoAttr } from "@batch-flask/core";
import { InboundEndpointProtocol, NetworkSecurityGroupRuleAccess } from "app/models";

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
    @DtoAttr() public networkSecurityGroupRules: NetworkSecurityGroupRuleDto[];
    @DtoAttr() public protocol: InboundEndpointProtocol;
}

export class PoolEndPointConfigurationDto extends Dto<PoolEndPointConfigurationDto> {
    @DtoAttr() public inboundNATPools: InboundNATPoolDto[];
}
