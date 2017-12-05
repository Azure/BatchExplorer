
export type OsType = "linux" | "windows";

export interface RegionPrices {
    windows: OSPricing;
    linux: OSPricing;
}

export interface VMPrices {
    regular: number;
    lowpri: number;
}

export class OSPricing {
    private _map: Map<string, VMPrices> = new Map();

    constructor(public name: string, public os: OsType) { }

    public add(vmsize: string, lowpri: boolean, price: number) {
        if (!this._map.has(vmsize)) {
            this._map.set(vmsize, {
                regular: null,
                lowpri: null,
            });
        }
        const vmPrices = this._map.get(vmsize);
        if (lowpri) {
            if (vmPrices.lowpri !== null) {
                console.log("Duplicate vm", lowpri, vmsize, "for region");
            }
            vmPrices.lowpri = price;
        } else {
            if (vmPrices.regular !== null) {
                console.log("Duplicate vm", lowpri, vmsize, "for region");
            }
            vmPrices.regular = price;
        }
    }

    public toJS() {
        return [...this._map];
    }

    public getVMPrices(vmSize: string): VMPrices {
        if (this._map.has(vmSize)) {
            return null;
        }
        return this._map.get(vmSize);
    }

    public getPrice(vmSize: string, lowpri = false): number {
        if (this._map.has(vmSize)) {
            return null;
        }
        const vm = this._map.get(vmSize);
        return lowpri ? vm.lowpri : vm.regular;
    }
}

export class PricingMap {
    private _map: Map<string, RegionPrices> = new Map();

    public add(region: string, vmName: string, price: number) {
        if (!this._map.has(region)) {
            this._map.set(region, {
                linux: new OSPricing(region, "linux"),
                windows: new OSPricing(region, "windows"),
            });
        }
        const regionPricing = this._map.get(region);
        const { os, lowpri, vmsize } = this._parseVmName(vmName);
        regionPricing[os].add(vmsize, lowpri, price);
    }

    public getPrice(region: string, os: OsType, vmsize: string, lowpri = false): number {
        const osPricing = this.getOSPricing(region, os);
        if (!os) { return null; }

        return osPricing.getPrice(vmsize, lowpri);
    }

    public getVMPrices(region: string, os: OsType, vmsize: string, lowpri = false): VMPrices {
        const osPricing = this.getOSPricing(region, os);
        if (!osPricing) { return null; }

        return osPricing.getVMPrices(vmsize);
    }

    public getOSPricing(region: string, os: OsType): OSPricing {
        if (!this._map.has(region)) {
            return null;
        }

        return this._map.get(region)[os];
    }

    public toJS() {
        return [...this._map].map(([region, x]) => {
            return [region, {
                windows: x.windows.toJS(),
                linux: x.linux.toJS(),
            }];
        });
    }

    private _parseVmName(name: string): { os: OsType, lowpri: boolean, vmsize: string } {
        const segments = name.split(" ", 2);
        const vmsize = segments[0];
        const os = name.includes("(Windows)") ? "windows" : "linux";
        const lowpri = name.includes("Low Priority");
        return { os, lowpri, vmsize };
    }
}
