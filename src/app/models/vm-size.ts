import { Model, Prop, Record } from "@batch-flask/core";

export interface VmSizeAttributes {
    name: string;
    numberOfCores: number;
    osDiskSizeInMB: number;
    resourceDiskSizeInMB: number;
    memoryInMB: number;
    maxDataDiskCount: number;
}

@Model()
export class VmSize extends Record<VmSizeAttributes> {
    /**
     * Id for the vmSize(This is computed form the name attribute)
     */
    @Prop() public id: string;

    /**
     * Specifies the name of the virtual machine size
     */
    @Prop() public name: string;

    /**
     * Specifies the number of available CPU cores.
     */
    @Prop() public numberOfCores: number;

    /**
     * Specifies the size in MB of the operating system disk.
     */
    @Prop() public osDiskSizeInMB: number;

    /**
     * Specifies the size in MB of the temporary or resource disk.
     */
    @Prop() public resourceDiskSizeInMB: number;

    /**
     * Specifies the available RAM in MB.
     */
    @Prop() public memoryInMB: number;

    /**
     * Specifies the maximum number of data disks that can be attached to the VM size.
     */
    @Prop() public maxDataDiskCount: number;

    constructor(data: VmSizeAttributes) {
        super({ ...data, id: data.name && data.name.toLowerCase() } as any);
    }
}
