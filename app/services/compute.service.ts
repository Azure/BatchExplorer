import { Injectable } from "@angular/core";
import { RequestOptions, Response, URLSearchParams } from "@angular/http";
import { Resource } from "app/models";
import { Observable, empty } from "rxjs";
import { expand, flatMap, map, reduce, share } from "rxjs/operators";
import { ArmHttpService } from "./arm-http.service";
import { AzureHttpService } from "./azure-http.service";
import { BatchAccountService } from "./batch-account.service";
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
                private accountService: BatchAccountService,
                private azure: AzureHttpService,
                private subscriptionService: SubscriptionService) {
    }

    public getQuotas(): Observable<ComputeUsage[]> {
        return this.accountService.currentAccount.pipe(
            flatMap((account) => {
                const { subscription, location } = account;

                const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/usages`;
                return this.arm.get(url).pipe(map((response) => response.json().value));
            }),
            share(),
        );
    }

    public getCoreQuota(): Observable<number> {
        return this.getQuotas().pipe(
            map(x => this._getTotalRegionalQuotas(x)),
            share(),
        );
    }

    public listCustomImages(subscriptionId: string, location: string): Observable<Resource[]> {
        const search = new URLSearchParams();
        search.set("$filter", `resourceType eq '${computeImageProvider}' and location eq '${location}'`);
        const options = new RequestOptions({ search });

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get(subscription, resourceUrl(subscriptionId), options).pipe(
                    expand(obs => {
                        return obs.json().nextLink ?
                            this.azure.get(subscription, obs.json().nextLink, options) : empty();
                    }),
                    reduce((images, response: Response) => {
                        return [...images, ...response.json().value];
                    }, []),
                );
            }),
            share(),
        );
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
