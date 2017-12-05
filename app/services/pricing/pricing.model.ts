export type OsType = "linux" | "windows";

export interface RegionPrices {
    windows: OSPricing;
    linux: OSPricing;
}

export interface VMPrices {
    regular: number;
    lowpri: number;
}

const missingCategoryRegex = /^a[0-9]+$/;

export class OSPricing {
    public static fromJS(name, os, data: any[]): OSPricing {
        const pricing = new OSPricing(name, os);
        pricing._map = new Map(data);
        return pricing;
    }
    private _map: Map<string, VMPrices> = new Map();

    constructor(public name: string, public os: OsType) { }

    public add(vmsize: string, lowpri: boolean, price: number) {
        vmsize = vmsize.toLowerCase().replace(/\./g, "_");
        if (missingCategoryRegex.exec(vmsize)) {
            vmsize = `standard_${vmsize}`;
        }
        if (!this._map.has(vmsize)) {
            this._map.set(vmsize, {
                regular: null,
                lowpri: null,
            });
        }
        const vmPrices = this._map.get(vmsize);
        if (lowpri) {
            vmPrices.lowpri = price;
        } else {
            vmPrices.regular = price;
        }
    }

    public toJS() {
        return [...this._map];
    }

    public getVMPrices(vmsize: string): VMPrices {
        vmsize = vmsize.toLowerCase();
        if (!this._map.has(vmsize)) { return null; }
        return this._map.get(vmsize);
    }

    public getPrice(vmsize: string, lowpri = false): number {
        const vm = this.getVMPrices(vmsize);
        if (!vm) { return null; }
        return lowpri ? vm.lowpri : vm.regular;
    }
}

export class PricingMap {
    public static fromJS(data: any[]): PricingMap {
        const pricing = new PricingMap();
        const entries = data.map(([region, x]) => {
            return [region, {
                windows: OSPricing.fromJS(region, "windows", x.windows),
                linux: OSPricing.fromJS(region, "linux", x.linux),
            }];
        });
        pricing._map = new Map(entries as any);
        return pricing;
    }

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
