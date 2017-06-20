import { Model, Prop, Record } from "app/core";

export interface NetworkConfigurationAttributes {
    subnetId: string;
}

/**
 * Class for displaying The network configuration for the pool.
 */
@Model()
export class NetworkConfiguration extends Record<NetworkConfigurationAttributes> {
    @Prop() public subnetId: string;
}
