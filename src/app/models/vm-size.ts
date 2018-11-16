import { Model, Prop, Record } from "@batch-flask/core";

export interface VmSizeFilterValue {
    category: string;
    searchName?: string;
}

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

export const batchExplorerDataVms = {
    category: {
        all: [ ".*" ],
        compute: [
            "^standard_f[0-9a-z]*$",
            "^standard_f[0-9a-z]*_[v2]*$",
            "^standard_f[0-9a-z]*_[v3]*$",
        ],
        memory: [
            "^standard_g[0-9a-z]*$",
            "^standard_d[0-9a-z]*$",
            "^standard_d[0-9a-z]*_[v2]*$",
        ],
        gpu: [
            "^standard_n[0-9a-z]*$",
            "^standard_n[0-9a-z]*_[v2]*$",
            "^standard_n[0-9a-z]*_[v3]*$",
        ],
        hpc: [
            "^standard_h[0-9a-z]*$",
            "^standard_a8",
            "^standard_a9",
            "^standard_a10",
            "^standard_a11",
        ],
        standard: [
            "^standard_a[0-9a-z]*$",
            "^standard_d[0-9a-z]*$",
            "^basic_a[0-9a-z]*$",
        ],
        a: [
            "^basic_a[0-9a-z]*$",
            "^standard_a[0-9a-z]*$",
            "^standard_a[0-9a-z]*_[v2]*$",
        ],
        d: [
            "^standard_d[0-9a-z]*$",
            "^standard_d[0-9a-z]*_[v2]*$",
            "^standard_d[0-9a-z]*_[v3]*$",
        ],
        ev3: [
            "^standard_e[0-9a-z]*_[v3]*$",
        ],
        f: [
            "^standard_f[0-9a-z]*$",
            "^standard_f[0-9a-z]*s_[v2]*$",
        ],
        g: [
            "^standard_g[0-9a-z]*$",
        ],
        h: [
            "^standard_h[0-9a-z]*$",
        ],
        nc: [
            "^standard_nc",
            "^standard_nc[0-9a-z]*_[v2]*$",
            "^standard_nc[0-9a-z]*_[v3]*$",
        ],
        nv: [
            "^standard_nv",
        ],
        m: [
            "^standard_m",
        ],
    },
    all: [
        // Standard_D
        "^standard_d[0-9]*$",
        // Standard_Dv2
        "^standard_d[0-9]*_[v2]*$",
        // Standard_Dv3
        "^standard_d[0-9]*_[v3]*$",
        // Standard_G
        "^standard_g[0-9]*$",
        // Standard_H
        "^standard_h[0-9a-z]*$",
        // Standard_Av2
        "standard_a4_v2",
        "standard_a8_v2",
        "standard_a4m_v2",
        "standard_a8m_v2",
        // Standard_MS
        "standard_m64ms",
        "standard_m128s",
        // Standard_Ev3
        "standard_e2_v3",
        "standard_e4_v3",
        "standard_e8_v3",
        "standard_e16_v3",
        "standard_e32_v3",
        "standard_e64_v3",
    ],
    paas: [
        // Standard_A0_A7
        "small",
        "medium",
        "large",
        "extralarge",
        "^a[0-9]$",
    ],
    iaas: [
        // Basic_A
        "^basic_a[1-9][0-9]*$", // special case that basic_a0 is not supported
        // Standard_A0_A7
        "^standard_a[1-9][0-9]*$", // special case that standard_a0 is not supported
        // Standard_F, Standard_FSv2
        "^standard_f[0-9a-z]*$",
        "^standard_f[0-9a-z]*_[v2]*$",
        // Standard_NV
        "^standard_nv[0-9a-z]*$",
        // Standard_NC, Standard_NCv2, Standard_NCv3
        "^standard_nc",
        "^standard_nc[0-9a-z]*_[v2]*$",
        "^standard_nc[0-9a-z]*_[v3]*$",
        // Standard_Av2
        "standard_a2m_v2",
        "standard_a1_v2",
        "standard_a2_v2",
        // Standard_DS
        "^standard_ds[0-9a-z]*$",
        // Standard_DSv2
        "^standard_ds[0-9a-z]*_[v2]*$",
        // Standard_DSv3
        "^standard_d[0-9a-z]*s_[v3]*$",
        // Standard_ESv3
        "^standard_e((?!20)[0-9])*s_[v3]*$", // special case that e20s_v3 is not supported
        // Standard_GS
        "^standard_gs[0-9a-z]*$",
        // Standard_LS
        "^standard_l[0-9a-z]*s$",
        // Standard_ND
        "^standard_nd[0-9a-z]*$",
        // Standard_MS
        "standard_m64s",
        "standard_m128ms",
    ],
};
