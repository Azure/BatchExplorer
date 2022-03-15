import { Icon, IconSources } from "@batch-flask/ui/icon";
import { CloudServiceOsFamily, OSType, Pool, PoolAllocationState, VmSize } from "app/models";
import { SoftwarePricing, VMPrices } from "app/services/pricing";
import { List } from "immutable";
import * as Icons from "./icons";

export interface PoolPrice {
    total: number;
    dedicated: number;
    lowPri: number;
    unit: string;
}

export interface PoolPriceOptions {
    /**
     * If we should show the target price vs the current.
     * @default false.
     */
    target?: boolean;
}

const iconMapping = {
    "ubuntuserver": Icons.ubuntu,
    "ubuntu-server-container": Icons.ubuntu,
    "ubuntu-server-container-rdma": Icons.ubuntu,
    "centos": Icons.centos,
    "centos-hpc": Icons.centos,
    "windowsserver": Icons.windows,
    "debian": Icons.debian,
    "debian-10": Icons.debian,
    "oracle-linux": Icons.oracle,
    "linux-data-science-vm": Icons.linux,
    "ubuntu-1804": Icons.ubuntu,
    "linux-data-science-vm-ubuntu": Icons.ubuntu,
    "opensuse-Leap": Icons.openSUSE,
    "sles": Icons.openSUSE,
    "sles-hpc": Icons.openSUSE,
    "standard-data-science-vm": Icons.windows,
    "dsvm-win-2019": Icons.windows,
    "rendering-windows2016": Icons.windows,
    "autodesk-maya-arnold-centos73": Icons.centos,
    "rendering-centos73": Icons.centos,
};

export class PoolUtils {
    public static isIaas(pool: Pool) {
        return Boolean(pool && pool.virtualMachineConfiguration);
    }

    public static isPaas(pool: Pool) {
        return Boolean(pool && pool.cloudServiceConfiguration);
    }

    public static isWindows(pool: Pool, agentOsMap: any = {}) {
        return this.isPaas(pool) || this.isWindowsIaas(pool, agentOsMap);
    }

    public static isWindowsIaas(pool: Pool, agentOsMap: any = {}) {
        if (this.isPaas(pool)) {
            return false;
        }

        if (!pool.virtualMachineConfiguration) {
            return false;
        }

        // First check if the node agent SKU matches any known skus
        const sku = pool.virtualMachineConfiguration.nodeAgentSKUId;
        if (agentOsMap && agentOsMap[sku] && agentOsMap[sku] === "windows") {
            return true;
        }

        // Fallback to mapping on the os name
        const ref = pool.virtualMachineConfiguration.imageReference;
        return this.isOfferWindows(ref.offer);
    }

    public static isLinux(pool: Pool) {
        return this.getOsType(pool) === OSType.Linux;
    }

    public static isOfferLinux(offer: string) {
        return !this.isOfferWindows(offer);
    }

    public static isOfferWindows(offer: string): boolean {
        return /windows/i.test(offer);
    }

    public static iconForOffer(offerName: string) {
        const icon = iconMapping[offerName?.toLowerCase()];
        if (icon) {
            return icon;
        }

        // double check if we can parse out the kind of icon we need.
        // these will be the majority of any new rendering offers.
        if (this.isOfferWindows(offerName)) {
            return Icons.windows;
        } else if (/centos/i.test(offerName)) {
            return Icons.centos;
        } else {
            return new Icon(IconSources.fa, "fa-microchip");
        }
    }

    public static iconForPool(pool: Pool) {
        if (pool.virtualMachineConfiguration) {
            const ref = pool.virtualMachineConfiguration.imageReference;
            return this.iconForOffer(ref && ref.offer);
        } else {
            return this.iconForOffer("WindowsServer");
        }
    }

    public static getOsType(pool: Pool): OSType | null {
        if (pool.cloudServiceConfiguration) {
            return OSType.Windows;
        } else if (pool.virtualMachineConfiguration) {
            const agentId = pool.virtualMachineConfiguration.nodeAgentSKUId;
            if (!agentId) { return null; }
            return agentId.startsWith("batch.node.windows") ? OSType.Windows : OSType.Linux;
        } else {
            return null;
        }
    }

    public static getOsName(pool: Pool): string {
        if (pool.cloudServiceConfiguration) {
            const osFamily = pool.cloudServiceConfiguration.osFamily;
            if (osFamily === CloudServiceOsFamily.windowsServer2008R2) {
                return "Windows Server 2008 R2 SP1";
            } else if (osFamily === CloudServiceOsFamily.windowsServer2012) {
                return "Windows Server 2012";
            } else if (osFamily === CloudServiceOsFamily.windowsServer2012R2) {
                return "Windows Server 2012 R2";
            } else if (osFamily === CloudServiceOsFamily.windowsServer2016) {
                return "Windows Server 2016";
            } else {
                return "Windows Server 2019";
            }
        }

        if (pool.virtualMachineConfiguration) {
            const config = pool.virtualMachineConfiguration;
            if (!config.imageReference) {
                return "Unkown";
            }

            if (config.imageReference.virtualMachineImageId) {
                const osType = this.getOsType(pool);
                return `Custom image (${osType})`;
            }

            if (config.imageReference.publisher === "MicrosoftWindowsServer") {
                return `Windows Server ${pool.virtualMachineConfiguration.imageReference.sku}`;
            }

            const { offer, sku } = pool.virtualMachineConfiguration.imageReference;

            return `${offer} ${sku}`;
        }

        return "Unknown";
    }

    public static getComputePoolOsIcon(osType: OSType): string {
        if (osType === OSType.Linux) {
            return "linux";
        } else if (osType === OSType.Windows) {
            return "windows";
        }

        return "cloud";
    }

    /**
     * Display the status of the pool nodes nicely.
     * @param pool Pool
     * @param current Current number of nodes
     * @param target Target number of nodes
     */
    public static poolNodesStatus(pool: Pool, current: number, target: number) {
        if (pool.allocationState === PoolAllocationState.resizing || pool.resizeErrors.size > 0) {
            return `${current} → ${target}`;
        } else {
            return `${current}`;
        }
    }

    public static computePoolPrice(
        pool: Pool,
        vmSpec: VmSize,
        nodeCost: VMPrices,
        softwarePricing: SoftwarePricing,
        options: PoolPriceOptions = {}): PoolPrice | null {
        if (!nodeCost) {
            return null;
        }
        const count = PoolUtils._getPoolNodes(pool, options.target);
        const dedicatedCount = count.dedicated || 0;
        const lowPriCount = count.lowPri || 0;

        let dedicatedPrice = nodeCost.regular * dedicatedCount;
        let lowPriPrice = nodeCost.lowpri * lowPriCount;

        let licenses = List<string>(pool.applicationLicenses.slice());
        if (licenses.contains("vray")) {
            licenses = licenses.push("vrayrt");
        }

       licenses.forEach((license: string) => {
            dedicatedPrice += softwarePricing.getPrice(license, vmSpec.numberOfCores, vmSpec.numberOfGpus) * dedicatedCount;
            lowPriPrice += softwarePricing.getPrice(license, vmSpec.numberOfCores, vmSpec.numberOfGpus) * lowPriCount;
        });

        return {
            dedicated: dedicatedPrice,
            lowPri: lowPriPrice,
            total: dedicatedPrice + lowPriPrice,
            unit: "USD",
        };
    }

    public static hasGPU(pool: Pool): boolean {
        return Boolean(pool.vmSize && pool.vmSize.toLowerCase().startsWith("standard_n"));
    }

    private static _getPoolNodes(pool, target = false) {
        if (target) {
            return {
                dedicated: pool.targetDedicatedNodes,
                lowPri: pool.targetLowPriorityNodes,
            };
        } else {
            return {
                dedicated: pool.currentDedicatedNodes,
                lowPri: pool.currentLowPriorityNodes,
            };
        }
    }
}
