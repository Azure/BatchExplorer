import { Record } from "immutable";

const VmSizeRecord = Record({
    name: null,
    numberOfCores: null,
    osDiskSizeInMB: null,
    resourceDiskSizeInMB: null,
    memoryInMB: null,
    maxDataDiskCount: null,
});

export interface VmSizeAttributes {
    name: string;
    numberOfCores: number;
    osDiskSizeInMB: number;
    resourceDiskSizeInMB: number;
    memoryInMB: number;
    maxDataDiskCount: number;
}

export class VmSize extends VmSizeRecord implements VmSizeAttributes {
    /**
     * Specifies the name of the virtual machine size
     */
    public name: string;

    /**
     * Specifies the number of available CPU cores.
     */
    public numberOfCores: number;

    /**
     * Specifies the size in MB of the operating system disk.
     */
    public osDiskSizeInMB: number;

    /**
     * Specifies the size in MB of the temporary or resource disk.
     */
    public resourceDiskSizeInMB: number;

    /**
     * Specifies the available RAM in MB.
     */
    public memoryInMB: number;

    /**
     * Specifies the maximum number of data disks that can be attached to the VM size.
     */
    public maxDataDiskCount: number;
}
