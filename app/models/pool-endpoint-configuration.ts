import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

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
    @ListProp(NetworkSecurityGroupRule) public networkSecurityGroupRules: List<NetworkSecurityGroupRule> = List([]);
    @Prop() public protocol: InboundEndpointProtocol;
}

export interface PoolEndpointConfigurationAttributes {
    inboundNATPools: InboundNATPoolAttributes[];
}

/**
 * Class for displaying The network configuration for the pool.
 */
@Model()
export class PoolEndpointConfiguration extends Record<PoolEndpointConfigurationAttributes> {
    @ListProp(InboundNATPool) public inboundNATPools: List<InboundNATPool> = List([]);
}
