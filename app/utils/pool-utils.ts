import { Icon, IconSources } from "app/components/base/icon";
import { Pool } from "app/models";
import * as Icons from "./icons";

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

    public static isOfferWindows(offer: string) {
        return /^.*Windows.*$/.test(offer);
    }

    public static iconForOffer(offerName: string) {
        const icon = iconMapping[offerName];
        if (icon) {
            return icon;
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

            if (osFamily === 2) {
                return "Windows Server 2008 R2 SP1";
            } else if (osFamily === 3) {
                return "Windows Server 2012";
            } else if (osFamily === 4) {
                return "Windows Server 2012 R2";
            } else {
                return "Windows Server 2016";
            }
        }

        if (pool.virtualMachineConfiguration) {
            if (pool.virtualMachineConfiguration.imageReference.publisher ===
                "MicrosoftWindowsServer") {
                return `Windows Server ${pool.virtualMachineConfiguration.imageReference.sku}`;
            }

            const { offer, sku } = pool.virtualMachineConfiguration.imageReference;

            return `${offer} ${sku}`;
        }

        return "Unknown";
    }

    public static getComputePoolOsIcon(osName): string {
        if (osName.includes("Windows")) {
            return "windows";
        }

        return "linux";
    }
}
