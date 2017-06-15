import { Record } from "immutable";

const NetworkConfigurationRecord = Record({
    subnetId: null,
});

/**
 * Class for displaying The network configuration for the pool.
 */
export class NetworkConfiguration extends NetworkConfigurationRecord {
    public subnetId: string;
}
