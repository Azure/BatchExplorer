import { Injectable } from "@angular/core";
import { StringUtils, log } from "@batch-flask/utils";
import { ArmBatchAccount, BatchAccount, VmSize } from "app/models";
import { List } from "immutable";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { filter, map, share, shareReplay, take } from "rxjs/operators";
import { ArmHttpService } from "./arm-http.service";
import { BatchAccountService } from "./batch-account";
import { computeUrl } from "./compute.service";
import { ArmListResponse } from "./core";
// import { GithubDataService } from "./github-data";

// const includedVmsSizesPath = "data/vm-sizes.json";

// TODO: Move to Batch-explorer/data later
export const includedVmsSizes = {
    category: {
        all: [ ".*" ],
        compute: [
            "^standard_f[0-9a-z]*$",
            "^standard_f[0-9a-z]*_[v2]*$",
            "^standard_f[0-9a-z]*_[v3]*$",
        ],
        memory: [
            "^standard_g[0-9a-z]*$",
            "^standard_d[0-9a-z]*$",
            "^standard_d[0-9a-z]*_[v2]*$",
        ],
        gpu: [
            "^standard_n[0-9a-z]*$",
            "^standard_n[0-9a-z]*_[v2]*$",
            "^standard_n[0-9a-z]*_[v3]*$",
        ],
        hpc: [
            "^standard_h[0-9a-z]*$",
            "^standard_a8",
            "^standard_a9",
            "^standard_a10",
            "^standard_a11",
        ],
        standard: [
            "^standard_a[0-9a-z]*$",
            "^standard_d[0-9a-z]*$",
            "^basic_a[0-9a-z]*$",
        ],
        a: [
            "^basic_a[0-9a-z]*$",
            "^standard_a[0-9a-z]*$",
            "^standard_a[0-9a-z]*_[v2]*$",
        ],
        d: [
            "^standard_d[0-9a-z]*$",
            "^standard_d[0-9a-z]*_[v2]*$",
            "^standard_d[0-9a-z]*_[v3]*$",
        ],
        ev3: [
            "^standard_e[0-9a-z]*_[v3]*$",
        ],
        f: [
            "^standard_f[0-9a-z]*$",
            "^standard_f[0-9a-z]*s_[v2]*$",
        ],
        g: [
            "^standard_g[0-9a-z]*$",
        ],
        h: [
            "^standard_h[0-9a-z]*$",
        ],
        nc: [
            "^standard_nc",
            "^standard_nc[0-9a-z]*_[v2]*$",
            "^standard_nc[0-9a-z]*_[v3]*$",
        ],
        nv: [
            "^standard_nv",
        ],
        m: [
            "^standard_m",
        ],
    },
    all: [
        // Standard_D
        "^standard_d[0-9]*$",
        // Standard_Dv2
        "^standard_d[0-9]*_[v2]*$",
        // Standard_Dv3
        "^standard_d[0-9]*_[v3]*$",
        // Standard_G
        "^standard_g[0-9]*$",
        // Standard_H
        "^standard_h[0-9a-z]*$",
        // Standard_Av2
        "standard_a4_v2",
        "standard_a8_v2",
        "standard_a4m_v2",
        "standard_a8m_v2",
        // Standard_MS
        "standard_m64ms",
        "standard_m128s",
        // Standard_Ev3
        "standard_e2_v3",
        "standard_e4_v3",
        "standard_e8_v3",
        "standard_e16_v3",
        "standard_e32_v3",
        "standard_e64_v3",
    ],
    paas: [
        // Standard_A0_A7
        "small",
        "medium",
        "large",
        "extralarge",
        "^a[0-9]$",
    ],
    iaas: [
        // Basic_A
        "^basic_a[1-9][0-9]*$", // special case that basic_a0 is not supported
        // Standard_A0_A7
        "^standard_a[1-9][0-9]*$", // special case that standard_a0 is not supported
        // Standard_F, Standard_FSv2
        "^standard_f[0-9a-z]*$",
        "^standard_f[0-9a-z]*_[v2]*$",
        // Standard_NV
        "^standard_nv[0-9a-z]*$",
        // Standard_NC, Standard_NCv2, Standard_NCv3
        "^standard_nc",
        "^standard_nc[0-9a-z]*_[v2]*$",
        "^standard_nc[0-9a-z]*_[v3]*$",
        // Standard_Av2
        "standard_a2m_v2",
        "standard_a1_v2",
        "standard_a2_v2",
        // Standard_DS
        "^standard_ds[0-9a-z]*$",
        // Standard_DSv2
        "^standard_ds[0-9a-z]*_[v2]*$",
        // Standard_DSv3
        "^standard_d[0-9a-z]*s_[v3]*$",
        // Standard_ESv3
        "^standard_e((?!20)[0-9])*s_[v3]*$", // special case that e20s_v3 is not supported
        // Standard_GS
        "^standard_gs[0-9a-z]*$",
        // Standard_LS
        "^standard_l[0-9a-z]*s$",
        // Standard_ND
        "^standard_nd[0-9a-z]*$",
        // Standard_MS
        "standard_m64s",
        "standard_m128ms",
    ],
};

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
    private _includedSizes = new BehaviorSubject<IncludedSizes>(null);
    private _vmSizeCategories = new BehaviorSubject<StringMap<string[]>>(null);

    private _currentAccount: BatchAccount;

    constructor(
        private arm: ArmHttpService,
        // private githubData: GithubDataService,
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
        const data: VmSizeData = {
            category: includedVmsSizes.category,
            included: {
                all: includedVmsSizes.all,
                paas: includedVmsSizes.paas,
                iaas: includedVmsSizes.iaas,
            },
        };
        this._vmSizeCategories.next(data.category);
        this._includedSizes.next(data.included);

        // this.githubData.get(includedVmsSizesPath).subscribe({
        //     next: (response: string) => {
        //         const data: VmSizeData = JSON.parse(response);
        //         this._vmSizeCategories.next(data.category);
        //         this._includedSizes.next(data.included);
        //     },
        //     error: (error) => {
        //         log.error("Error loading included vm sizes from github", error);
        //     },
        // });
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
                if (StringUtils.regexExpTest(size.name.toLowerCase(), regex)) {
                    return true;
                }
            }
            return false;
        }));
    }
}
