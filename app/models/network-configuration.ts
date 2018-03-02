import { Model, Prop, Record } from "@bl-common/core";

export interface NetworkConfigurationAttributes {
    subnetId: string;
    endpointConfiguration: any;
}

/**
 * Class for displaying The network configuration for the pool.
 */
@Model()
export class NetworkConfiguration extends Record<NetworkConfigurationAttributes> {
    @Prop() public subnetId: string;
    @Prop() public endpointConfiguration: any;
}
