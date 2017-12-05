import { Injectable } from "@angular/core";
import * as moment from "moment";
import { Observable } from "rxjs";

import { Pool, RateCardMeter } from "app/models";
import { OSPricing, OsType, PricingMap, VMPrices } from "app/services/pricing";
import { PoolPrice, PoolPriceOptions, PoolUtils, log } from "app/utils";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";
import { LocalFileStorage } from "./local-file-storage.service";

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

@Injectable()
export class PricingService {
    public pricing: Observable<PricingMap>;
    private _pricingMap = new BehaviorSubject<PricingMap>(null);

    constructor(
        private arm: ArmHttpService,
        private localFileStorage: LocalFileStorage,
        private accountService: AccountService) {

        this.pricing = this._pricingMap.filter(x => x !== null);
    }

    public init() {
        this._loadPricings();
    }

    /**
     * Get the prices for all vms for a given region
     * @param region Account location
     * @param os OS for the VM.
     */
    public getPrices(os: OsType): Observable<OSPricing> {
        return this.accountService.currentAccount.flatMap((account) => {
            return this.pricing.take(1).map((map) => {
                return map.getOSPricing(account.location, os);
            });
        });
    }

    public getVmPrices(os: OsType, vmSize: string): Observable<VMPrices> {
        return this.accountService.currentAccount.flatMap((account) => {
            return this.pricing.take(1).map((map) => {
                return map.getVMPrices(account.location, os, vmSize);
            });
        });
    }

    public getPrice(os: OsType, vmSize: string, lowpri = false): Observable<number> {
        return this.accountService.currentAccount.flatMap((account) => {
            return this.pricing.take(1).map((map) => {
                return map.getPrice(account.location, os, vmSize, lowpri);
            });
        });
    }

    /**
     * Compute the price of a pool
     * @param pool Pool
     */
    public computePoolPrice(pool: Pool, options: PoolPriceOptions = {}): Observable<PoolPrice> {
        const os = PoolUtils.isWindows(pool) ? "windows" : "linux";
        return this.getVmPrices(os, pool.vmSize).map((cost) => {
            return PoolUtils.computePoolPrice(pool, cost, options);
        });
    }

    private _loadPricingFromApi() {
        return this._loadRateCardMeters().map((x) => this._processMeters(x)).cascade((map) => {
            this._savePricing(map);
            this._pricingMap.next(map);
        });
    }

    private _loadRateCardMeters(): Observable<RateCardMeter[]> {
        return this.accountService.currentAccount.flatMap((account) => {
            const { subscription } = account;

            const url = `${commerceUrl(subscription.subscriptionId)}/RateCard?$filter=${rateCardFilter()}`;
            return this.arm.get(url).map((response) => response.json().Meters);
        }).share();
    }

    private _processMeters(meters: RateCardMeter[]): PricingMap {
        const vms = new PricingMap();
        const categories = new Set();
        for (const meter of meters) {
            categories.add(meter.MeterCategory);
            if (meter.MeterCategory === "Virtual Machines") {
                if (meter.MeterStatus === "Active"
                    && meter.MeterRegion !== ""
                    && meter.MeterRegion !== "Azure Stack"
                    && meter.MeterRegion in regionMapping
                    && !meter.MeterSubCategory.includes("VM_Promo")) {
                    vms.add(regionMapping[meter.MeterRegion], meter.MeterSubCategory, meter.MeterRates["0"]);
                }
            }
        }

        return vms;
    }

    private _loadPricings() {
        this._loadPricingFromStorage().cascade((map) => {
            if (map) {
                this._pricingMap.next(map);
                return true;
            } else {
                return this._loadPricingFromApi();
            }
        });
    }

    private _loadPricingFromStorage(): Observable<PricingMap> {
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
            return PricingMap.fromJS(data.map);
        }).catch((error) => {
            log.error("Error retrieving pricing locally", error);
            return Observable.of(null);
        });
    }

    private _savePricing(map: PricingMap) {
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
}
