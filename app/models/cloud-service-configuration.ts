import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
const CloudServiceConfigurationRecord = Record({
    osFamily: null,
    targetOSVersion: null,
    currentOSVersion: null,
});

/**
 * Class for displaying Batch CloudServiceConfiguration information.
 */
export class CloudServiceConfiguration extends CloudServiceConfigurationRecord {
    public osFamily: number;
    public targetOSVersion: string;
    public currentOSVersion: string;
}
