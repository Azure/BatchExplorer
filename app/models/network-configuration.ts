import { Model, Prop, Record } from "@batch-flask/core";
import { PoolEndpointConfiguration, PoolEndpointConfigurationAttributes } from "./pool-endpoint-configuration";

export interface NetworkConfigurationAttributes {
    subnetId: string;
    endpointConfiguration: PoolEndpointConfigurationAttributes;
}

/**
 * Class for displaying The network configuration for the pool.
 */
@Model()
export class NetworkConfiguration extends Record<NetworkConfigurationAttributes> {
    @Prop() public subnetId: string;
    @Prop() public endpointConfiguration: PoolEndpointConfiguration;
}
