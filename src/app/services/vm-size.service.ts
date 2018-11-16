import { Injectable } from "@angular/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, BatchAccount, VmSize } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { filter, map, share, shareReplay, take } from "rxjs/operators";
import { ArmHttpService } from "./arm-http.service";
import { BatchAccountService } from "./batch-account";
import { computeUrl } from "./compute.service";
import { ArmListResponse } from "./core";
import { GithubDataService } from "./github-data";

const includedVmsSizesPath = "data/vm-sizes-list.json";

interface VmSizeData {
    category: StringMap<string[]>;
    included: IncludedSizes;
}

interface IncludedSizes {
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
    public additionalVmSizeCores = {
        extrasmall: 1,
        small: 1,
        medium: 2,
        large: 4,
        extralarge: 8,
    };

    private _sizes = new BehaviorSubject<List<VmSize>>(null);
    private _includedSizes = new BehaviorSubject<IncludedSizes|null>(null);
    private _vmSizeCategories = new BehaviorSubject<StringMap<string[]>>(null);

    private _currentAccount: BatchAccount;

    constructor(
        private arm: ArmHttpService,
        private githubData: GithubDataService,
        private accountService: BatchAccountService) {

        const obs = combineLatest(this._sizes, this._includedSizes);
        this.sizes = this._sizes.pipe(filter(x => x !== null));

        this.cloudServiceSizes = obs.pipe(
            map(([sizes, included]) => {
                if (!included) {
                    return sizes;
                }
                return this.filterSizes(sizes, included.all.concat(included.paas));
            }),
            shareReplay(1),
        );

        this.virtualMachineSizes = obs.pipe(
            map(([sizes, included]) => {
                if (!included) {
                    return sizes;
                }
                return this.filterSizes(sizes, included.all.concat(included.iaas));
            }),
            shareReplay(1),
        );

        this.vmSizeCategories = this._vmSizeCategories.asObservable();
    }

    public init() {
        this.accountService.currentAccount.subscribe((account: BatchAccount) => {
            this._currentAccount = account;
            this.load();
        });
        this.loadVmSizeData();
    }

    public load() {
        if (!(this._currentAccount instanceof ArmBatchAccount)) { return; }
        const { subscription, location } = this._currentAccount;
        const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/vmSizes`;
        this.arm.get<ArmListResponse<any>>(url).subscribe({
            next: (response) => {
                const sizes = response.value.map(x => new VmSize(x));
                this._sizes.next(List<VmSize>(sizes));
            },
            error: (error) => {
                log.error("Error loading vm sizes for account ", { account: this._currentAccount.toJS(), error });
            },
        });
    }

    public loadVmSizeData() {
        this.githubData.get(includedVmsSizesPath).subscribe({
            next: (response: string) => {
                const responseJson = JSON.parse(response);
                const data: VmSizeData = {
                    category: responseJson.category,
                    included: {
                        all: responseJson.all,
                        paas: responseJson.paas,
                        iaas: responseJson.iaas,
                    },
                };
                this._vmSizeCategories.next(data.category);
                this._includedSizes.next(data.included);
            },
            error: (error) => {
                log.error("Error loading included vm sizes from github", error);
            },
        });
    }

    public get(vmSize: string): Observable<VmSize> {
        return this.sizes.pipe(
            map(sizes => {
                return sizes.filter(x => x.name.toLowerCase() === vmSize.toLowerCase()).first();
            }),
            take(1),
            share(),
        );
    }
    /**
     * Filter the given list of vm sizes by including any patching the given patterns.
     * @param sizes Sizes to filter
     * @param includedPatterns List of regex patterns to include
     */
    public filterSizes(sizes: List<VmSize>, includedPatterns: string[]): List<VmSize> {
        if (!sizes) {
            return null;
        }
        return List<VmSize>(sizes.filter((size) => {
            for (const regex of includedPatterns) {
                if (new RegExp(regex).test(size.name.toLowerCase())) {
                    return true;
                }
            }
            return false;
        }));
    }
}
