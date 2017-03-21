import { Record } from "immutable";

// tslint:disable:variable-name object-literal-sort-keys
const WindowsConfigurationRecord = Record({
    enableAutomaticUpdates: false,
});

/**
 * Class for displaying Batch WindowsConfiguration information.
 */
export class WindowsConfiguration extends WindowsConfigurationRecord {
    public enableAutomaticUpdates: boolean;
}
