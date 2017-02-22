import { Pool } from "app/models";

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
}
