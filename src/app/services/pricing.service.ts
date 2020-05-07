import { Injectable } from "@angular/core";
import { GlobalStorage } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, BatchSoftwareLicense, BatchSoftwareSkus, Pool, RateCardMeter } from "app/models";
import { BatchPricing, OSPricing, OsType, SoftwarePricing, VMPrices } from "app/services/pricing";
import { PoolPrice, PoolPriceOptions, PoolUtils } from "app/utils";
import { DateTime } from "luxon";
import { BehaviorSubject, Observable, forkJoin, from, of } from "rxjs";
import { catchError, filter, flatMap, map, share, take } from "rxjs/operators";
import { ArmHttpService } from "./arm-http.service";
import { BatchAccountService } from "./batch-account";
import { VmSizeService } from "./compute";

const pricingFilename = "pricing";

export function commerceUrl(subscriptionId: string) {
    return `subscriptions/${subscriptionId}/providers/Microsoft.Commerce`;
}

export function rateCardFilter() {
    return `OfferDurableId eq 'MS-AZR-0003P' and Currency eq 'USD' and Locale eq 'en-US' and RegionInfo eq 'US'`;
}

const regionMapping = {
    "US West 2": "westus2",
    "AP Southeast": "southeastasia",
    "BR South": "brazilsouth",
    "AU East": "australiaeast",
    "US West": "westus",
    "CA East": "canadaeast",
    "UK South": "uksouth",
    "US Central": "centralus",
    "US East 2": "eastus2",
    "AU Southeast": "australiasoutheast",
    "US East": "eastus",
    "JA East": "japaneast",
    "KR South": "koreasouth",
    "CA Central": "canadacentral",
    "FR South": "francesouth",
    "EU West": "westeurope",
    "AP East": "eastasia",
    "JA West": "japanwest",
    "US North Central": "northcentralus",
    "EU North": "northeurope",
    "UK North": "uknorth",
    "UK West": "ukwest",
    "US South Central": "southcentralus",
    "IN South": "southindia",
    "IN West": "westindia",
    "IN Central": "centralindia",
    "KR Central": "koreacentral",
    "FR Central": "francecentral",
    "US West Central": "westcentralus",
    "UK South 2": "uksouth2",
};

const softwareMeterId = {
    "da155550-4041-54ce-bf5c-385c0bd5eaba": BatchSoftwareLicense.arnold,
    "0ec88494-2022-4939-b809-0d914d954692": BatchSoftwareLicense["3dsmax"],
    "1d3bb602-0cde-4618-9fb0-f9d94805c2a6": BatchSoftwareLicense.maya,
    "e2d2d63e-8741-499a-8989-f5f7ec5c3b3f": BatchSoftwareLicense.vray,
    "450f680c-b109-486a-8fec-2b9e7ab0fbc9": BatchSoftwareLicense.vrayrt,
};

@Injectable({ providedIn: "root" })
export class PricingService {
    public pricing: Observable<BatchPricing>;
    public theSku: string;
    private _pricingMap = new BehaviorSubject<BatchPricing>(null);

    constructor(
        private arm: ArmHttpService,
        private vmSizeService: VmSizeService,
        private gobalStorage: GlobalStorage,
        private accountService: BatchAccountService) {

        this.pricing = this._pricingMap.pipe(filter(x => x !== null));
    }

    public init() {
        this._loadPricings();
    }

    public getSoftwarePricing(): Observable<SoftwarePricing> {
        return this._getPrice((account, pricing) => {
            console.log("PRICING FOR SOFTWARES: ", pricing.softwares);
            return pricing.softwares;
        });
    }

    /**
     * Get the prices for all vms for a given region
     * @param region Account location
     * @param os OS for the VM.
     */
    public getPrices(os: OsType): Observable<OSPricing> {
        return this._getPrice((account, pricing) => {
            return pricing.nodes.getOSPricing(account.location, os);
        });
    }

    public getVmPrices(os: OsType, vmSize: string): Observable<VMPrices> {
        return this._getPrice((account, pricing) => {
            return pricing.nodes.getVMPrices(account.location, os, vmSize);
        });
    }

    public getPrice(os: OsType, vmSize: string, lowpri = false): Observable<number> {
        return this._getPrice((account, pricing) => {
            return pricing.nodes.getPrice(account.location, os, vmSize, lowpri);
        });
    }

    /**
     * Compute the price of a pool
     * @param pool Pool
     */
    public computePoolPrice(pool: Pool, options: PoolPriceOptions = {}): Observable<PoolPrice> {
        const os = PoolUtils.isWindows(pool) ? "windows" : "linux";
        const vmSizeObs = this.vmSizeService.get(pool.vmSize);
        const priceObs = this.getVmPrices(os, pool.vmSize);
        return forkJoin(vmSizeObs, priceObs).pipe(map(([vmSpec, cost]) => {
            const softwarePricing = this._pricingMap.value.softwares;
            return PoolUtils.computePoolPrice(pool, vmSpec, cost, softwarePricing, options);
        }));
    }

    private _loadPricingFromApi() {
        const obs = this._loadRateCardMeters().pipe(map(x => this._processMeters(x)));
        obs.subscribe((map) => {
            this._savePricing(map);
            this._pricingMap.next(map);
        });
        return obs;
    }

    private _loadRateCardMeters(): Observable<RateCardMeter[]> {
        return this.accountService.currentAccount.pipe(
            take(1),
            flatMap((account) => {
                if (account instanceof ArmBatchAccount) {
                    const { subscription } = account;

                    const url = `${commerceUrl(subscription.subscriptionId)}/RateCard?$filter=${rateCardFilter()}`;
                    return this.arm.get<any>(url).pipe(map((response) => response.Meters));
                } else {
                    return of([]);
                }
            }),
            share(),
        );
    }

    private _processMeters(meters: RateCardMeter[]): BatchPricing {
        const pricing = new BatchPricing();
        const categories = new Set();
        for (const meter of meters) {
            categories.add(meter.MeterCategory);
            if (meter.MeterCategory === "Virtual Machines") {
                if (meter.MeterStatus === "Active"
                    && meter.MeterRegion !== ""
                    && meter.MeterRegion !== "Azure Stack"
                    && meter.MeterRegion in regionMapping) {

                    pricing.nodes.add(
                        regionMapping[meter.MeterRegion],
                        meter.MeterSubCategory,
                        meter.MeterName,
                        meter.MeterRates["0"]);
                }
            }
        }
        this._processSoftwaresPricings(meters, pricing);

        return pricing;
    }

    // IMPORTANT FOR PRICING CHANGES IN SOFTWARE
    private _processSoftwaresPricings(meters: RateCardMeter[], pricing: BatchPricing) {
        for (const meter of meters) {
            // debugger;
            // console.log("EACH METER: ", meter);
            if (meter.MeterId in softwareMeterId) {
                console.log("meter.MeterId: ", meter.MeterId);
                const software = softwareMeterId[meter.MeterId];
                console.log("THE SOFTWARE: ", software);
                console.log("THE METER NAME: ", meter.MeterName);
                // const perCore = meter.MeterName.toLowerCase().includes("1 vcpu");
                switch (meter.MeterName.toLowerCase()) {
                    case "1 vcpu":
                        this.theSku = BatchSoftwareSkus.core;
                        break;
                    case "1 gpu":
                        this.theSku = BatchSoftwareSkus.gpu;
                        break;
                    default:
                        this.theSku = BatchSoftwareSkus.node;
                }
                console.log("The CORE: ", this.theSku);
                console.log("THIS IS THE PRICE: ", meter.MeterRates["0"]);
                pricing.softwares.add(software, meter.MeterRates["0"], this.theSku);
            }
        }
    }

    private _loadPricings() {
        this._loadPricingFromStorage().subscribe((map) => {
            if (map) {
                this._pricingMap.next(map);
                return true;
            } else {
                return this._loadPricingFromApi();
            }
        });
    }

    private _loadPricingFromStorage(): Observable<BatchPricing> {
        return from(this.gobalStorage.get(pricingFilename)).pipe(
            map((data: { lastSync: string, map: any } | null) => {
                // If wrong format
                if (!data || !data.lastSync || !data.map) {
                    return null;
                }

                const lastSync = DateTime.fromISO(data.lastSync);
                const weekOld = DateTime.local().minus({ days: 7 });
                if (lastSync < weekOld) {
                    return null;
                }
                return BatchPricing.fromJS(data.map);
            }),
            catchError((error) => {
                log.error("Error retrieving pricing locally", error);
                return of(null);
            }),
        );
    }

    private _savePricing(map: BatchPricing) {
        const data = {
            lastSync: new Date().toISOString(),
            map: map.toJS(),
        };
        this.gobalStorage.set(pricingFilename, data).catch((error) => {
            log.error("Error saving harwaremap", error);
        });
    }

    /**
     * Wait for the prices and account to be loaded and returns callback
     * @param callback Callback when account and prices are loaded
     */
    private _getPrice<T>(callback: (account: ArmBatchAccount, pricing: BatchPricing) => T) {
        console.log("WHATS HERE? :", this.accountService.currentAccount);
        return this.accountService.currentAccount.pipe(
            take(1),
            flatMap((account) => {
                if (account instanceof ArmBatchAccount) {
                    return this.pricing.pipe(
                        take(1),
                        map(map => callback(account, map)),
                    );
                } else {
                    return of(null);
                }
            }),
            share(),
        );
    }
}
