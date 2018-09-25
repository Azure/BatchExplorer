import { Model, Record } from "@batch-flask/core";

export interface WindowsConfigurationAttributes {
    enableAutomaticUpdates: boolean;
}

/**
 * Class for displaying Batch WindowsConfiguration information.
 */
@Model()
export class WindowsConfiguration extends Record<WindowsConfigurationAttributes> {
    public enableAutomaticUpdates: boolean;
}
