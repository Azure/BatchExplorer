import { Model, Record, Prop } from "@batch-flask/core/record";

export interface WindowsConfigurationAttributes {
    enableAutomaticUpdates: boolean;
}

/**
 * Class for displaying Batch WindowsConfiguration information.
 */
@Model()
export class WindowsConfiguration extends Record<WindowsConfigurationAttributes> {
    @Prop() public enableAutomaticUpdates: boolean;
}
