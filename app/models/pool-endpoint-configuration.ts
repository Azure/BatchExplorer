import { Model, Prop, Record } from "@batch-flask/core";

export enum InboundEndpointProtocol {
    TCP = "tcp",
    UDP = "udp",
}

export enum NetworkSecurityGroupRuleAccess {
    Allow = "allow",
    Deny = "deny",
}

export interface NetworkSecurityGroupRuleAttributes {
    access: NetworkSecurityGroupRuleAccess;
    priority: number;
    sourceAddressPrefix: string;
}

export interface InboundNATPoolAttributes {
    backendPort: number;
    frontendPortRangeEnd: number;
    frontendPortRangeStart: number;
    name: string;
    networkSecurityGroupRules: NetworkSecurityGroupRuleAttributes[];
    protocol: InboundEndpointProtocol;
}

export interface PoolEndpointConfigurationAttributes {
    inboundNATPools: InboundNATPoolAttributes[];
}

@Model()
export class NetworkSecurityGroupRule extends Record<NetworkSecurityGroupRuleAttributes> {
    @Prop() public access: NetworkSecurityGroupRuleAccess;
    @Prop() public priority: number;
    @Prop() public sourceAddressPrefix: string;
}

@Model()
export class InboundNATPool extends Record<InboundNATPoolAttributes> {
    @Prop() public backendPort: number;
    @Prop() public frontendPortRangeEnd: number;
    @Prop() public frontendPortRangeStart: number;
    @Prop() public name: string;
    @Prop() public networkSecurityGroupRules: NetworkSecurityGroupRule[];
    @Prop() public protocol: InboundEndpointProtocol;
}

@Model()
export class PoolEndpointConfiguration extends Record<PoolEndpointConfigurationAttributes> {
    @Prop() public inboundNATPools: InboundNATPool[];
}
