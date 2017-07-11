import { Injectable } from "@angular/core";
import { List } from "immutable";
import * as moment from "moment";
import { Observable } from "rxjs";

import { Headers, RequestOptions } from "@angular/http";
import { SpecCost } from "app/models";
import { SecureUtils, log } from "app/utils";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";
import { GithubDataService } from "./github-data.service";
import { LocalFileStorage } from "./local-file-storage.service";

const resourceIdsPath = "data/vm-resource-ids.json";
const hardwaremapFilename = "hardware-map.json";

interface PricingResource {
    ResourceId: string;
    Multiplier: number;
}

interface PricingOS {
    [os: string]: PricingResource;
}

interface PricingLocation {
    [os: string]: PricingOS;
}

interface HardwareMap {
    [location: string]: PricingLocation;
}

interface ResourceSpec {
    id: string;
    firstParty: Array<{ resourceId: string, quantity: number }>;
    thirdParty: Array<{ resourceId: string, quantity: number }>;
}

const specCostUrl = "https://s2.billing.ext.azure.com/api/Billing/Subscription/GetSpecsCosts";

@Injectable()
export class PricingService {
    private hardwareMap: Observable<HardwareMap>;
    private _hardwareMap = new BehaviorSubject<HardwareMap>(null);

    constructor(
        private arm: ArmHttpService,
        private githubData: GithubDataService,
        private localFileStorage: LocalFileStorage,
        private accountService: AccountService) {

        this.hardwareMap = this._hardwareMap.filter(x => x !== null);
    }

    public init() {
        return this._loadResourceIds();
    }

    /**
     * Get the prices for all vms for a given region
     * @param region Account location
     * @param os OS for the VM.
     */
    public getPrices(region: string, os: "linux" | "windows"): Observable<List<SpecCost>> {
        return this._getResourceFor(region, os).flatMap((specs) => {

            return this.accountService.currentAccount.flatMap((account) => {
                const subId = account.subscription.subscriptionId;

                const options = new RequestOptions();
                options.headers = new Headers();
                options.headers.append("x-ms-client-request-id", SecureUtils.uuid());
                options.headers.append("x-ms-client-session-id", SecureUtils.uuid());
                options.headers.append("Content-type", "application/json");
                const data = {
                    subscriptionId: subId,
                    specResourceSets: specs,
                    specsToAllowZeroCost: [],
                    specType: "VM",
                };
                return this.arm.post(specCostUrl, JSON.stringify(data), options).map((response) => {
                    const costs = response.json().costs;
                    if (!costs) {
                        log.error("Unexpected format returned from GetSpecsCosts", response.json());
                        return [];
                    }
                    return List<SpecCost>(costs.map(x => new SpecCost(x))) as any;
                });
            });
        });
    }

    private _getResourceFor(region: string, os: "linux" | "windows"): Observable<ResourceSpec[]> {
        return this.hardwareMap.first().map((hardwareMap: HardwareMap) => {
            const regionData = hardwareMap[region.toLowerCase()];
            if (!regionData) {
                return [];
            }

            const osData = regionData[os.toLowerCase()];
            if (!osData) {
                return [];
            }

            return Object.keys(osData).map(x => this._buildSpec(x, osData[x]));
        });
    }

    private _buildSpec(size, data: PricingResource): ResourceSpec {
        return {
            id: size,
            firstParty: [{
                resourceId: data.ResourceId,
                quantity: 744,
            }],
            thirdParty: [],
        };
    }

    private _loadResourceIds() {
        this._loadResourceIdsFromStorage().cascade((map) => {
            if (map) {
                this._hardwareMap.next(map);
                return true;
            } else {
                return this._loadResourceIdsFromGithub();
            }
        });
    }

    private _loadResourceIdsFromStorage(): Observable<HardwareMap> {
        return this.localFileStorage.get(hardwaremapFilename).map((data: { lastSync: string, map: HardwareMap }) => {
            // If wrong format
            if (!data.lastSync || !data.map) {
                return null;
            }

            const lastSync = moment(data.lastSync);
            const weekOld = moment().subtract(7, "days");
            if (lastSync.isBefore(weekOld)) {
                return null;
            }
            return data.map;
        }).catch((error) => {
            log.error("Error retrieving hardwaremap locally", error);
            return null;
        });
    }

    private _loadResourceIdsFromGithub(): Observable<boolean> {
        const obs = this.githubData.get(resourceIdsPath);
        obs.subscribe({
            next: (response) => {
                this._buildHardwareMap(response.json());
            },
            error: (error) => {
                log.error("Error loading resource ids for pricing", error);
            },
        });
        return obs.map(x => true);
    }

    private _buildHardwareMap(data: StringMap<StringMap<StringMap<PricingResource>>>) {
        let hardwareMap: HardwareMap = {};
        for (let sizeName of Object.keys(data)) {
            const size = data[sizeName];
            for (let regionName of Object.keys(size)) {
                const region = size[regionName];
                if (!(regionName.toLowerCase() in hardwareMap)) {
                    hardwareMap[regionName.toLowerCase()] = {};
                }

                const hardwareMapRegion = hardwareMap[regionName.toLowerCase()];

                for (let osName of Object.keys(region)) {
                    const os = region[osName];
                    if (!(osName.toLowerCase() in hardwareMapRegion)) {
                        hardwareMapRegion[osName.toLowerCase()] = {};
                    }

                    hardwareMapRegion[osName.toLowerCase()][sizeName.toLowerCase()] = os;
                }
            }
        }

        this._hardwareMap.next(hardwareMap);
        this._saveHardwareMap(hardwareMap);
    }

    private _saveHardwareMap(map: HardwareMap) {
        const data = {
            lastSync: new Date().toISOString(),
            map,
        };
        this.localFileStorage.set(hardwaremapFilename, data).subscribe({
            error: (error) => {
                log.error("Error saving harwaremap", error);
            },
        });
    }
}
