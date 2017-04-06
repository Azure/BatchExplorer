import { Injectable } from "@angular/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { Headers, RequestOptions } from "@angular/http";
import { SpecCost } from "app/models";
import { ArmHttpService } from "app/services";
import { SecureUtils, log } from "app/utils";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AccountService } from "./account.service";
import { GithubDataService } from "./github-data.service";

const resourceIdsPath = "data/vm-resource-ids.json";

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
        private accountService: AccountService) {

        this.hardwareMap = this._hardwareMap.filter(x => x !== null);
    }

    public init() {
        return this._loadResourceIds();
    }

    public getPrices(region: string, os: "linux" | "windows"): Observable<List<SpecCost>> {
        return this._getResourceFor(region, os).flatMap((specs) => {

            return this.accountService.currentAccount.flatMap((account) => {
                const subId = account.subscription.subscriptionId;

                console.log("Specs", specs);
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
                    return List(costs.map(x => new SpecCost(x)));
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
        const obs = this.githubData.get(resourceIdsPath);
        obs.subscribe({
            next: (response) => {
                this._buildHardwareMap(response.json());
            },
            error: (error) => {
                log.error("Error loading resource ids for pricing", error);
            },
        });
        return obs;
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

        console.log("Built map", hardwareMap);
        this._hardwareMap.next(hardwareMap);
    }
}
