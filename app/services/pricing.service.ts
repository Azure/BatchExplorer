import { Injectable } from "@angular/core";
import * as moment from "moment";
import { BehaviorSubject, Observable } from "rxjs";

import { AccountResource, BatchSoftwareLicense, Pool, RateCardMeter } from "app/models";
import { BatchPricing, OSPricing, OsType, SoftwarePricing, VMPrices } from "app/services/pricing";
import { PoolPrice, PoolPriceOptions, PoolUtils, log } from "app/utils";
import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";
import { LocalFileStorage } from "./local-file-storage.service";
import { VmSizeService } from "./vm-size.service";

const pricingFilename = "pricing.json";

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
    "089f79d8-0349-432c-96a6-8add90b8a40e": BatchSoftwareLicense.arnold,
    "0ec88494-2022-4939-b809-0d914d954692": BatchSoftwareLicense["3dsmax"],
    "1d3bb602-0cde-4618-9fb0-f9d94805c2a6": BatchSoftwareLicense.maya,
    "e2d2d63e-8741-499a-8989-f5f7ec5c3b3f": BatchSoftwareLicense.vray,
};

@Injectable()
export class PricingService {
    public pricing: Observable<BatchPricing>;
    private _pricingMap = new BehaviorSubject<BatchPricing>(null);

    constructor(
        private arm: ArmHttpService,
        private vmSizeService: VmSizeService,
        private localFileStorage: LocalFileStorage,
        private accountService: AccountService) {

        this.pricing = this._pricingMap.filter(x => x !== null);
    }

    public init() {
        this._loadPricings();
    }

    public getSoftwarePricing(): Observable<SoftwarePricing> {
        return this._getPrice((account, pricing) => {
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
        return Observable.forkJoin(vmSizeObs, priceObs).map(([vmSpec, cost]) => {
            const softwarePricing = this._pricingMap.value.softwares;
            return PoolUtils.computePoolPrice(pool, vmSpec, cost, softwarePricing, options);
        });
    }

    private _loadPricingFromApi() {
        const obs = this._loadRateCardMeters().map((x) => this._processMeters(x));
        obs.subscribe((map) => {
            this._savePricing(map);
            this._pricingMap.next(map);
        });
        return obs;
    }

    private _loadRateCardMeters(): Observable<RateCardMeter[]> {
        return this.accountService.currentAccount.flatMap((account) => {
            const { subscription } = account;

            const url = `${commerceUrl(subscription.subscriptionId)}/RateCard?$filter=${rateCardFilter()}`;
            return this.arm.get(url).map((response) => response.json().Meters);
        }).share();
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
                    && meter.MeterRegion in regionMapping
                    && !meter.MeterSubCategory.includes("VM_Promo")) {
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

    private _processSoftwaresPricings(meters: RateCardMeter[], pricing: BatchPricing) {
        for (const meter of meters) {
            if (meter.MeterId in softwareMeterId) {
                const software = softwareMeterId[meter.MeterId];
                const perCore = meter.MeterSubCategory.includes("core)");
                pricing.softwares.add(software, meter.MeterRates["0"], perCore);
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
        return this.localFileStorage.get(pricingFilename).map((data: { lastSync: string, map: any }) => {
            // If wrong format
            if (!data.lastSync || !data.map) {
                return null;
            }

            const lastSync = moment(data.lastSync);
            const weekOld = moment().subtract(7, "days");
            if (lastSync.isBefore(weekOld)) {
                return null;
            }
            return BatchPricing.fromJS(data.map);
        }).catch((error) => {
            log.error("Error retrieving pricing locally", error);
            return Observable.of(null);
        });
    }

    private _savePricing(map: BatchPricing) {
        const data = {
            lastSync: new Date().toISOString(),
            map: map.toJS(),
        };
        this.localFileStorage.set(pricingFilename, data).subscribe({
            error: (error) => {
                log.error("Error saving harwaremap", error);
            },
        });
    }

    /**
     * Wait for the prices and account to be loaded and returns callback
     * @param callback Callback when account and prices are loaded
     */
    private _getPrice<T>(callback: (account: AccountResource, pricing: BatchPricing) => T) {
        return this.accountService.currentAccount.take(1).flatMap((account) => {
            return this.pricing.take(1).map((map) => {
                return callback(account, map);
            });
        }).share();
    }
}
