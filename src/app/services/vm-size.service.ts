import { Injectable, OnDestroy } from "@angular/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, VmSize } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subject, combineLatest, of } from "rxjs";
import { catchError, map, publishReplay, refCount, share, switchMap, take, takeUntil } from "rxjs/operators";
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

@Injectable({ providedIn: "root" })
export class VmSizeService implements OnDestroy {
    /**
     * All sizes
     */
    public sizes: Observable<List<VmSize> | null>;

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

    private _includedSizes = new BehaviorSubject<IncludedSizes | null>(null);
    private _vmSizeCategories = new BehaviorSubject<StringMap<string[]>>(null);
    private _destroy = new Subject();

    constructor(
        private arm: ArmHttpService,
        private githubData: GithubDataService,
        accountService: BatchAccountService) {

        this.loadVmSizeData();

        this.sizes = accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    return of(null);
                } else {
                    return this._fetchVmSizesForAccount(account);
                }
            }),
            publishReplay(1),
            refCount(),
        );

        const obs = combineLatest(this.sizes, this._includedSizes);

        this.cloudServiceSizes = obs.pipe(
            map(([sizes, included]) => {
                if (!included) {
                    return sizes;
                }
                return this.filterSizes(sizes, included.all.concat(included.paas));
            }),
            publishReplay(1),
            refCount(),
        );

        this.virtualMachineSizes = obs.pipe(
            map(([sizes, included]) => {
                if (!included) {
                    return sizes;
                }
                return this.filterSizes(sizes, included.all.concat(included.iaas));
            }),
            publishReplay(1),
            refCount(),
        );

        this.vmSizeCategories = this._vmSizeCategories.asObservable();
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
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
            take(1),
            map((sizes) => {
                if (sizes) {
                    return sizes.filter(x => x.name.toLowerCase() === vmSize.toLowerCase()).first();
                } else {
                    return null;
                }
            }),
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

    private _fetchVmSizesForAccount(account: ArmBatchAccount): Observable<List<VmSize> | null> {
        const { subscription, location } = account;
        const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/vmSizes`;
        return this.arm.get<ArmListResponse<any>>(url).pipe(
            map((response) => {
                const sizes = response.value.map(x => new VmSize(x));
                return List<VmSize>(sizes);
            }),
            catchError((error) => {
                log.error("Error loading vm sizes for account ", { account: account.toJS(), error });
                return of(null);
            }),
        );
    }
}
