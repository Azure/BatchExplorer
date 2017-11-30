import { Icon, IconSources } from "app/components/base/icon";
import { CloudServiceOsFamily, Pool, PoolAllocationState, SpecCost } from "app/models";
import { LowPriDiscount } from "app/utils/constants";
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
    "UbuntuServer": Icons.ubuntu,
    "CentOS": Icons.centos,
    "CentOS-HPC": Icons.centos,
    "WindowsServer": Icons.windows,
    "Debian": Icons.debian,
    "Oracle-Linux": Icons.oracle,
    "linux-data-science-vm": Icons.linux,
    "openSUSE-Leap": Icons.openSUSE,
    "SLES": Icons.openSUSE,
    "SLES-HPC": Icons.openSUSE,
    "standard-data-science-vm": Icons.windows,
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
        let sku = pool.virtualMachineConfiguration.nodeAgentSKUId;
        if (agentOsMap && agentOsMap[sku] && agentOsMap[sku] === "windows") {
            return true;
        }

        // Fallback to mapping on the os name
        let ref = pool.virtualMachineConfiguration.imageReference;
        return this.isOfferWindows(ref.offer);
    }

    public static isLinux(pool: Pool) {
        if (this.isPaas(pool)) {
            return false;
        }
        let ref = pool.virtualMachineConfiguration.imageReference;
        return this.isOfferLinux(ref.offer);
    }

    public static isOfferLinux(offer: string) {
        return !this.isOfferWindows(offer);
    }

    public static isOfferWindows(offer: string): boolean {
        return /windows/i.test(offer);
    }

    public static iconForOffer(offerName: string) {
        const icon = iconMapping[offerName];
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

    public static getOsName(pool: Pool): string {
        if (pool.cloudServiceConfiguration) {
            let osFamily = pool.cloudServiceConfiguration.osFamily;
            if (osFamily === CloudServiceOsFamily.windowsServer2008R2) {
                return "Windows Server 2008 R2 SP1";
            } else if (osFamily === CloudServiceOsFamily.windowsServer2012) {
                return "Windows Server 2012";
            } else if (osFamily === CloudServiceOsFamily.windowsServer2012R2) {
                return "Windows Server 2012 R2";
            } else {
                return "Windows Server 2016";
            }
        }

        if (pool.virtualMachineConfiguration) {
            const config = pool.virtualMachineConfiguration;
            if (!config.imageReference) {
                return "Unkown";
            }

            if (config.imageReference.virtualMachineImageId) {
                return "Custom image";
            }

            if (config.imageReference.publisher === "MicrosoftWindowsServer") {
                return `Windows Server ${pool.virtualMachineConfiguration.imageReference.sku}`;
            }

            const { offer, sku } = pool.virtualMachineConfiguration.imageReference;

            return `${offer} ${sku}`;
        }

        return "Unknown";
    }

    public static getComputePoolOsIcon(osName): string {
        if (osName === "Custom Image") {
            return "cloud";
        } else if (/windows/i.test(osName)) {
            return "windows";
        }

        return "linux";
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

    public static computePoolPrice(pool: Pool, cost: SpecCost, options: PoolPriceOptions = {}): PoolPrice {
        if (!cost) {
            return null;
        }
        const count = PoolUtils._getPoolNodes(pool, options.target);
        const dedicatedCount = count.dedicated || 0;
        const lowPriCount = count.lowPri || 0;

        const lowPriDiscount = PoolUtils.isWindows(pool) ? LowPriDiscount.windows : LowPriDiscount.linux;

        const dedicatedPrice = cost.amount * dedicatedCount;
        const lowPriPrice = cost.amount * lowPriCount * lowPriDiscount;

        return {
            dedicated: dedicatedPrice,
            lowPri: lowPriPrice,
            total: dedicatedPrice + lowPriPrice,
            unit: cost.currencyCode,
        };
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
