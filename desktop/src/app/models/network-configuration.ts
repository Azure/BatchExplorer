import { Model, Prop, Record } from "@batch-flask/core";
import { PoolEndpointConfiguration, PoolEndpointConfigurationAttributes } from "./pool-endpoint-configuration";
import {
    PublicIPAddressConfiguration,
    PublicIPAddressConfigurationAttributes,
} from "./public-ip-address-configuration";

export enum DynamicVNetAssignmentScope {
    Job = "job",
    None = "none",
}

export interface NetworkConfigurationAttributes {
    subnetId: string;
    endpointConfiguration: PoolEndpointConfigurationAttributes;
    dynamicVNetAssignmentScope: DynamicVNetAssignmentScope;
    publicIPAddressConfiguration: PublicIPAddressConfigurationAttributes;
}

/**
 * Class for displaying the network configuration for the pool.
 */
@Model()
export class NetworkConfiguration extends Record<NetworkConfigurationAttributes> {
    @Prop() public subnetId: string;
    @Prop() public endpointConfiguration: PoolEndpointConfiguration;
    @Prop() public dynamicVNetAssignmentScope: DynamicVNetAssignmentScope = DynamicVNetAssignmentScope.None;
    @Prop() public publicIPAddressConfiguration: PublicIPAddressConfiguration;
}
