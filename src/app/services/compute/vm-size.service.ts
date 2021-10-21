import { Injectable, OnDestroy } from "@angular/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, VmSize } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { catchError, map, publishReplay, refCount, share, switchMap, take, takeUntil } from "rxjs/operators";
import { ArmHttpService } from "../arm-http.service";
import { BatchAccountService } from "../batch-account";
import { GithubDataService } from "../github-data";
import { ArmListResponse } from "../core";
import { mapResourceSkuToVmSize } from "../../models/vm-size";

const includedVmsSizesPath = "data/vm-sizes-list.json";

export function supportedSkusUrl(subscriptionId: string, location: string) {
    return `/subscriptions/${subscriptionId}/providers/Microsoft.Batch/locations/${location}`
}

interface VmSizeCategories {
    category: StringMap<string[]>;
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
    // delete bc you can get this information directly through API
    public additionalVmSizeCores = {
        extrasmall: 1,
        small: 1,
        medium: 2,
        large: 4,
        extralarge: 8,
    };

    /** Placeholder categories until it's added as part of the Service */
    private _vmSizeCategories = new BehaviorSubject<StringMap<string[]>>(null);
    private _destroy = new Subject();

    constructor(
        private arm: ArmHttpService,
        private githubData: GithubDataService,
        accountService: BatchAccountService) {

        this.loadVmSizeCategories();

        this.cloudServiceSizes = accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    return of(null);
                } else {
                    const cloudServiceUrl = `${supportedSkusUrl(account.subscription.subscriptionId, account.location)}}/cloudServiceSkus?api-version=2021-06-01`
                    return this._fetchVmSkusForAccount(account, cloudServiceUrl);
                }
            }),
            publishReplay(1),
            refCount(),
        );

        this.virtualMachineSizes = accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    return of(null);
                } else {
                    const vmUrl = `${supportedSkusUrl(account.subscription.subscriptionId, account.location)}/virtualMachineSkus?api-version=2021-06-01`
                    return this._fetchVmSkusForAccount(account, vmUrl);
                }
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

    /**
     *  Placeholder categories until it's added as part of the Service
     */
    public loadVmSizeCategories() {
        this.githubData.get(includedVmsSizesPath).subscribe({
            next: (response: string) => {
                const responseJson = JSON.parse(response);
                const data: VmSizeCategories = {
                    category: responseJson.category,
                };
                this._vmSizeCategories.next(data.category);
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

    private _fetchVmSkusForAccount(account: ArmBatchAccount, query: string): Observable<List<VmSize> | null> {
        return this.arm.get<ArmListResponse<any>>(query).pipe(
            map((response) => {
                console.log(response);
                return mapResourceSkuToVmSize(response.value);
            }),
            catchError((error) => {
                log.error("Error loading vm sizes for account ", { account: account.toJS(), error });
                return of(null);
            }),
        );
    }
}
