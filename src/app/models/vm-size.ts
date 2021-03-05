import { Model, Prop, Record } from "@batch-flask/core";
import { List } from "immutable";

export interface VmSizeAttributes {
    name: string;
    numberOfCores: number;
    numberOfGpus: number;
    osDiskSizeInMB: number;
    resourceDiskSizeInMB: number;
    memoryInMB: number;
    maxDataDiskCount: number;
}

@Model()
export class VmSize extends Record<VmSizeAttributes> {
    /**
     * Id for the vmSize (this is computed from the name attribute).
     */
    @Prop() public id: string;

    /**
     * Specifies the name of the virtual machine size.
     */
    @Prop() public name: string;

    /**
     * Specifies the number of available CPU cores.
     */
    @Prop() public numberOfCores: number;

    /**
     * Specifies the number of available GPUs.
     */
    @Prop() public numberOfGpus: number;

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

/**
 *
 * @param skuJson
 */
export function mapResourceSkuToVmSize(skuJson: any): List<VmSize> {
    console.log("2", skuJson);
    const skuToCapabilities = _getCapabilitiesMap(skuJson);
    const skuToVmSize: VmSize[] = [];
    for (let skuName in skuToCapabilities) {
        const vmSize: Partial<VmSizeAttributes> = {};
        const capabilities = skuToCapabilities[skuName];
        vmSize.name = skuName;
        vmSize.numberOfCores = _parseIntOrReturnDefault(capabilities.get("vCPUs"));
        vmSize.numberOfGpus = _parseIntOrReturnDefault(capabilities.get("GPUs"));
        vmSize.osDiskSizeInMB = _parseIntOrReturnDefault(capabilities.get("OSVhdSizeMB"));
        vmSize.resourceDiskSizeInMB = _parseIntOrReturnDefault(capabilities.get("MaxResourceVolumeMB"));
        vmSize.memoryInMB = _parseFloatOrReturnDefault(capabilities.get("MemoryGB")) * 1024;
        vmSize.maxDataDiskCount = _parseIntOrReturnDefault(capabilities.get("MaxDataDiskCount"));
        skuToVmSize.push(new VmSize(vmSize as VmSizeAttributes));
    }
    console.log("1", skuToVmSize);
    return List<VmSize>(skuToVmSize);
}

function _getCapabilitiesMap(skuJson: any): any {
    const skuToCapabilities = {};
    for (let i = 0; i < skuJson.skus.length; i++) {
        const sku = skuJson.skus[i];
        const capabilities = new Map(sku.capabilities.map(capability => [capability.name, capability.value]));
        skuToCapabilities[sku.name] = capabilities;
    }
    console.log("3", skuToCapabilities);
    return skuToCapabilities;
}

function _parseIntOrReturnDefault(skuCapabilityValue : string): number {
    const value = parseInt(skuCapabilityValue);
    return isNaN(value) ? 0 : value;
}

function _parseFloatOrReturnDefault(skuCapabilityValue : string): number {
    const value = parseFloat(skuCapabilityValue);
    return isNaN(value) ? 0 : value;
}

// {
//     "name": "Standard_NV12s_v2", // name
//     "numberOfCores": 12, // capabilities[n].name === "vCPUs"
//     "osDiskSizeInMB": 1047552, // capabilities[n].name === "OSVhdSizeMB"
//     "resourceDiskSizeInMB": 688128, // capabilities[n].name === "MaxResourceVolumeMB"
//     "memoryInMB": 229376, // (capabilities[n].name === "MemoryGB") * 1024
//     "maxDataDiskCount": 24 // capabilities[n].name === "MaxDataDiskCount"
//     // capabilities[n].name === "GPUs"
//     },

// {locations: Array(1), capabilities: Array(21), locationInfo: Array(1), name: "Standard_B1ms", tier: "Standard", …}
