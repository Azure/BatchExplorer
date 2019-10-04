import { ListProp, Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";
import { PoolEndpointConfiguration, PoolEndpointConfigurationAttributes } from "./pool-endpoint-configuration";

export enum DynamicVNetAssignmentScope {
    Job = "job",
    None = "none",
}

export interface NetworkConfigurationAttributes {
    subnetId: string;
    endpointConfiguration: PoolEndpointConfigurationAttributes;
    dynamicVNetAssignmentScope: DynamicVNetAssignmentScope;
    publicIPs: List<string>;
}

/**
 * Class for displaying The network configuration for the pool.
 */
@Model()
export class NetworkConfiguration extends Record<NetworkConfigurationAttributes> {
    @Prop() public subnetId: string;
    @Prop() public endpointConfiguration: PoolEndpointConfiguration;
    @Prop() public dynamicVNetAssignmentScope: DynamicVNetAssignmentScope = DynamicVNetAssignmentScope.None;
    @ListProp(String) public publicIPs: List<string>;
}
