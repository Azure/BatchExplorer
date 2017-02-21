import { Record } from "immutable";

import { ImageReference } from "./image-reference";
import { WindowsConfiguration } from "./windows-configuration";

// tslint:disable:variable-name object-literal-sort-keys
const VirtualMachineConfigurationRecord = Record({
    imageReference: null,
    nodeAgentSKUId: null,
    windowsConfiguration: null,
});

/**
 * Class for displaying Batch VirtualMachineConfiguration information.
 */
export class VirtualMachineConfiguration extends VirtualMachineConfigurationRecord {
    public imageReference: ImageReference;
    public nodeAgentSKUId: string;
    public windowsConfiguration: WindowsConfiguration;
}
