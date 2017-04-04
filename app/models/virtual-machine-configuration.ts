import { Record } from "immutable";

import { ImageReference, ImageReferenceAttributes } from "./image-reference";
import { WindowsConfiguration } from "./windows-configuration";

// tslint:disable:variable-name object-literal-sort-keys
const VirtualMachineConfigurationRecord = Record({
    imageReference: null,
    nodeAgentSKUId: null,
    windowsConfiguration: null,
});

export interface VirtualMachineConfigurationAttributes {
    imageReference: ImageReferenceAttributes;
    nodeAgentSKUId: string;
    windowsConfiguration: WindowsConfiguration;
}

/**
 * Class for displaying Batch VirtualMachineConfiguration information.
 */
export class VirtualMachineConfiguration extends VirtualMachineConfigurationRecord {
    public imageReference: ImageReference;
    public nodeAgentSKUId: string;
    public windowsConfiguration: WindowsConfiguration;

    constructor(data: VirtualMachineConfigurationAttributes) {
        super(data);
    }
}
