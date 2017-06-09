import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AccountService } from "./account.service";
import { ArmHttpService } from "./arm-http.service";

export function computeUrl(subscriptionId: string) {
    return `subscriptions/${subscriptionId}/providers/Microsoft.Compute`;
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

@Injectable()
export class ComputeService {
    constructor(private arm: ArmHttpService, private accountService: AccountService) {
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

    private _getTotalRegionalQuotas(data: ComputeUsage[]): number {
        for (let obj of data) {
            if (obj.name && obj.name.localizedValue && obj.name.value) {
                if (obj.limit && obj.name.value.toLowerCase() === "cores") {
                    return obj.limit;
                }
            }
        }
        return 100;
    }
}
