import { Injectable } from "@angular/core";
import { RequestOptions, URLSearchParams } from "@angular/http";
import { Observable } from "rxjs";

import { Resource } from "app/models";
import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";
import { AzureHttpService } from "./azure-http.service";
import { SubscriptionService } from "./subscription.service";

export function computeUrl(subscriptionId: string) {
    return `subscriptions/${subscriptionId}/providers/Microsoft.Compute`;
}

export function resourceUrl(subscriptionId: string) {
    return `/subscriptions/${subscriptionId}/resources`;
}

export interface ComputeUsage {
    currentValue: number;
    limit: number;
    name: {
        localizedValue: string;
        value: string;
    };
    unit: string;
}

const computeProvider = "Microsoft.Compute";
const computeImageProvider = computeProvider + "/images";

@Injectable()
export class ComputeService {
    constructor(private arm: ArmHttpService,
                private accountService: AccountService,
                private azure: AzureHttpService,
                private subscriptionService: SubscriptionService) {
    }

    public getQuotas(): Observable<ComputeUsage[]> {
        return this.accountService.currentAccount.flatMap((account) => {
            const { subscription, location } = account;

            const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/usages`;
            return this.arm.get(url).map((response) => response.json().value);
        }).share();
    }

    public getCoreQuota(): Observable<number> {
        return this.getQuotas().map(x => this._getTotalRegionalQuotas(x)).share();
    }

    public listCustomImages(subscriptionId: string, location: string): Observable<Resource[]> {
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${computeImageProvider}' and location eq '${location}'`);
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId).flatMap((subscription) => {
            return this.azure.get(subscription, resourceUrl(subscriptionId), options).expand(obs => {
                return obs.json().nextLink ?
                    this.azure.get(subscription, obs.json().nextLink, options) : Observable.empty();
            }).reduce((images, response) => {
                return [...images, ...response.json().value];
            }, []);
        }).share();
    }

    private _getTotalRegionalQuotas(data: ComputeUsage[]): number {
        for (const obj of data) {
            if (obj.name && obj.name.localizedValue && obj.name.value) {
                if (obj.limit && obj.name.value.toLowerCase() === "cores") {
                    return obj.limit;
                }
            }
        }
        return 100;
    }
}
