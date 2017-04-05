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
const excludedVmsSizesUrl = `${githubRaw}/Azure/BatchLabs-data/master/data/vm-sizes.json`;

interface VmSizeData {
    category: StringMap<string[]>;
    excluded: ExcludedSizes;
}

interface ExcludedSizes {
    all: string[];
    paas: string[];
    iaas: string[];
}

@Injectable()
export class VmSizeService {
    /**
     * All sizes
     */
    public sizes: Observable<List<VmSize>>;

    /**
     * Only cloud services sizes supported
     */
    public cloudServiceSizes: Observable<List<VmSize>>;

    /**
     * Only virtual machine sizes supported
     */
    public virtualMachineSizes: Observable<List<VmSize>>;
    public vmSizeCategories: Observable<StringMap<string[]>>;

    private _sizes = new BehaviorSubject<List<VmSize>>(List([]));
    private _excludedSizes = new BehaviorSubject<ExcludedSizes>(null);
    private _vmSizeCategories = new BehaviorSubject<StringMap<string[]>>(null);

    private _currentAccount: AccountResource;

    constructor(private arm: ArmHttpService, private http: Http, private accountService: AccountService) {
        const obs = Observable.combineLatest(this._sizes, this._excludedSizes);
        this.sizes = this._sizes.asObservable();

        this.cloudServiceSizes = obs.map(([sizes, excluded]) => {
            if (!excluded) {
                return sizes;
            }
            return this._filterSizes(sizes, excluded.all.concat(excluded.paas));
        }).share();

        this.virtualMachineSizes = obs.map(([sizes, excluded]) => {
            if (!excluded) {
                return sizes;
            }
            return this._filterSizes(sizes, excluded.all.concat(excluded.iaas));
        }).share();

        this.vmSizeCategories = this._vmSizeCategories.asObservable();
    }

    public init() {
        this.accountService.currentAccount.subscribe((account: AccountResource) => {
            this._currentAccount = account;
            this.load();
        });
        this.loadVmSizeData();
    }

    public load() {
        const { subscription, location } = this._currentAccount;
        const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/vmSizes`;
        this.arm.get(url).subscribe({
            next: (response: Response) => {
                const data = response.json();
                const sizes = data.value.map(x => new VmSize(x));
                this._sizes.next(List<VmSize>(sizes));
            },
            error: (error) => {
                log.error("Error loading vm sizes for account ", { account: this._currentAccount.toJS(), error });
            },
        });
    }

    public loadVmSizeData() {
        this.http.get(excludedVmsSizesUrl).subscribe({
            next: (response: Response) => {
                const data: VmSizeData = response.json();
                this._vmSizeCategories.next(data.category);
                this._excludedSizes.next(data.excluded);
            },
            error: (error) => {
                log.error("Error loading excluded vm sizes from github", error);
            },
        });
    }

    public get(vmSize: string): Observable<VmSize> {
        return this._sizes.map(sizes => {
            return sizes.filter(x => x.name.toLowerCase() === vmSize.toLowerCase()).first();
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
