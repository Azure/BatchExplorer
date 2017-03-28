import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { AccountResource, VmSize } from "app/models";
import { AccountService, ArmHttpService } from "app/services";
import { StringUtils, log } from "app/utils";

export function computeUrl(subscriptionId: string) {
    return `subscriptions/${subscriptionId}/providers/Microsoft.Compute`;
}

const githubRaw = "https://raw.githubusercontent.com";
const excludedVmsSizesUrl = `${githubRaw}/Azure/BatchLabs-data/feature/vm-sizes/data/vm-sizes-excluded.json`;

interface ExcludedSizes {
    all: string[];
    paas: string[];
    iaas: string[];
}
@Injectable()
export class VmSizeService {
    public cloudServiceSizes: Observable<List<VmSize>>;
    public virtualMachineSizes: Observable<List<VmSize>>;
    private _sizes = new BehaviorSubject<List<VmSize>>(List([]));
    private _excludedSizes = new BehaviorSubject<ExcludedSizes>(null);

    private _currentAccount: AccountResource;

    constructor(private arm: ArmHttpService, private http: Http, private accountService: AccountService) {
        const obs = Observable.combineLatest(this._sizes, this._excludedSizes);

        this.cloudServiceSizes = obs.map(([sizes, excluded]) => {
            if (!excluded) {
                return sizes;
            }
            const a = this._filterSizes(sizes, excluded.all.concat(excluded.paas));
            console.log("CS", a.map(x => x.name).toJS());
            return a;
        }).share();
        this.cloudServiceSizes.subscribe();
        this.virtualMachineSizes = obs.map(([sizes, excluded]) => {
            if (!excluded) {
                return sizes;
            }
            const a = this._filterSizes(sizes, excluded.all.concat(excluded.iaas));
            console.log("VM", a.map(x => x.name).toJS());
            return a;
        }).share();
        this.virtualMachineSizes.subscribe();
    }

    public init() {
        this.accountService.currentAccount.subscribe((account: AccountResource) => {
            this._currentAccount = account;
            this.load();
        });
        this.loadExcludedPattern();
    }

    public load() {
        const { subscription, location } = this._currentAccount;
        const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/vmSizes`;
        this.arm.get(url).subscribe({
            next: (response: Response) => {
                const data = response.json();
                console.log("VM sizes", data);
                const sizes = data.value.map(x => new VmSize(x));
                this._sizes.next(List<VmSize>(sizes));
            },
            error: (error) => {
                log.error("Error loading vm sizes for account ", { account: this._currentAccount.toJS(), error });
            },
        });
    }

    public loadExcludedPattern() {
        this.http.get(excludedVmsSizesUrl).subscribe({
            next: (response: Response) => {
                const data = response.json();
                this._excludedSizes.next(data);
            },
            error: (error) => {
                log.error("Error loading excluded vm sizes from github", error);
            },
        });
    }

    /**
     * Filter the given list of vm sizes by excluding any patching the given patterns.
     * @param sizes Sizes to filter
     * @param excludePatterns List of wildcard patterns to exclude
     */
    private _filterSizes(sizes: List<VmSize>, excludePatterns: string[]): List<VmSize> {
        return List<VmSize>(sizes.filter((size) => {
            for (let wildcard of excludePatterns) {
                if (StringUtils.matchWildcard(size.name, wildcard)) {
                    return false;
                }
            }
            return true;
        }));
    }
}
