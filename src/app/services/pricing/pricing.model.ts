import { BatchSoftwareSkus } from "app/models/batch-software-skus";

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
    public static fromJS(name, os, data: any[]): OSPricing {
        const pricing = new OSPricing(name, os);
        pricing._map = new Map(data);
        return pricing;
    }
    private _map: Map<string, VMPrices> = new Map();

    constructor(public name: string, public os: OsType) { }

    public add(vmsize: string, lowpri: boolean, price: number) {
        vmsize = vmsize.toLowerCase().replace(/\./g, "_");
        if (!vmsize.startsWith("standard_")) {
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

export class NodePricing {
    public static fromJS(data: any[]): NodePricing {
        const pricing = new NodePricing();
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

    public add(region: string, category: string, vmName: string, price: number) {
        if (!this._map.has(region)) {
            this._map.set(region, {
                linux: new OSPricing(region, "linux"),
                windows: new OSPricing(region, "windows"),
            });
        }
        const regionPricing = this._map.get(region);
        const { os, lowpri, vmSizes } = this._parseVmName(category, vmName);
        for (const vmSize of vmSizes) {
            regionPricing[os].add(vmSize, lowpri, price);
        }
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

    private _parseVmName(category: string, name: string): { os: OsType, lowpri: boolean, vmSizes: string[] } {
        let lowpri = false;
        if (name.endsWith(" Low Priority")) {
            lowpri = true;
            name = name.replace(" Low Priority", "");
        }
        const vmSizes = name.split("/").map(x => x.replace(/ /g, "_").concat(
            category.contains("Promo") ? "_Promo" : ""));
        const os = category.includes("Windows") ? "windows" : "linux";
        return { os, lowpri, vmSizes };
    }
}

export interface SoftwarePrice {
    name: string;
    price: number;
    theSku: BatchSoftwareSkus;
}

export class SoftwarePricing {
    public static fromJS(data: any[]): SoftwarePricing {
        const pricing = new SoftwarePricing();
        pricing._map = new Map(data);
        return pricing;
    }
    private _map: Map<string, SoftwarePrice> = new Map();

    public add(software: string, price: number, theSku) {
        this._map.set(software, {
            name: software,
            price,
            theSku,
        });
    }

    public toJS() {
        return [...this._map];
    }

    public get(software: string): SoftwarePrice {
        return this._map.get(software);
    }

    // TODO: test this to make sure data.theSku works with logic
    public getPrice(software: string, coreCount = 1): number {
        const data = this._map.get(software);
        if (!data) { return null; }
        console.log("GET PRICE WHAT IS SKU FORMAT? :", data.theSku);
        return data.theSku ? coreCount * data.price : data.price;
    }
}

export class BatchPricing {
    public static fromJS(data): BatchPricing {
        const pricing = new BatchPricing();
        pricing.softwares = SoftwarePricing.fromJS(data.softwares);
        pricing.nodes = NodePricing.fromJS(data.nodes);
        return pricing;
    }

    public softwares = new SoftwarePricing();
    public nodes = new NodePricing();

    public toJS() {
        return {
            softwares: this.softwares.toJS(),
            nodes: this.nodes.toJS(),
        };
    }
}
