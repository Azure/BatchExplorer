import { Injectable, OnDestroy } from "@angular/core";
import { log } from "@batch-flask/utils";
import { ArmBatchAccount, VmSize } from "app/models";
import { List } from "immutable";
import { Observable, Subject, of, combineLatest } from "rxjs";
import { catchError, map, publishReplay, refCount, share, switchMap, take, takeUntil } from "rxjs/operators";
import { ArmHttpService } from "../arm-http.service";
import { BatchAccountService } from "../batch-account";
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
     * All sizes combining cloud service and virtual machine sizes supported
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

    public vmSizeCategories = of({
        all: [".*"],
        compute: [
            "^standard_f[0-9a-z]*$",
            "^standard_f[0-9a-z]*_[v2]*$",
            "^standard_f[0-9a-z]*_[v3]*$",
            "standard_fx4mds",
            "standard_fx12mds",
            "standard_fx24mds",
            "standard_fx36mds",
            "standard_fx48mds"
        ],
        memory: [
            "standard_d11_v2",
            "standard_d12_v2",
            "standard_d13_v2",
            "standard_d14_v2",
            "standard_d15_v2",

            "standard_ds11_v2",
            "standard_ds12_v2",
            "standard_ds13_v2",
            "standard_ds14_v2",
            "standard_ds15_v2",

            "standard_e2_v3",
            "standard_e4_v3",
            "standard_e8_v3",
            "standard_e16_v3",
            "standard_e32_v3",
            "standard_e64_v3",

            "standard_e2s_v3",
            "standard_e4s_v3",
            "standard_e8s_v3",
            "standard_e16s_v3",
            "standard_e32s_v3",
            "standard_e48s_v3",
            "standard_e64s_v3",

            "standard_e2a_v4",
            "standard_e4a_v4",
            "standard_e8a_v4",
            "standard_e16a_v4",
            "standard_e20a_v4",
            "standard_e32a_v4",
            "standard_e48a_v4",
            "standard_e64a_v4",
            "standard_e96a_v4",

            "standard_e2as_v4",
            "standard_e4as_v4",
            "standard_e8as_v4",
            "standard_e16as_v4",
            "standard_e20as_v4",
            "standard_e32as_v4",
            "standard_e48as_v4",
            "standard_e64as_v4",
            "standard_e96as_v4",

            "standard_e2d_v4",
            "standard_e4d_v4",
            "standard_e8d_v4",
            "standard_e16d_v4",
            "standard_e20d_v4",
            "standard_e32d_v4",
            "standard_e48d_v4",
            "standard_e64d_v4",

            "standard_e2ds_v4",
            "standard_e4ds_v4",
            "standard_e8ds_v4",
            "standard_e16ds_v4",
            "standard_e20ds_v4",
            "standard_e32ds_v4",
            "standard_e48ds_v4",
            "standard_e64ds_v4",
            "standard_e80ids_v4",

            "standard_m8ms",
            "standard_m16ms",
            "standard_m32ms",
            "standard_m32ls",
            "standard_m32ts",
            "standard_m64ls",
            "standard_m64",
            "standard_m64m",
            "standard_m64s",
            "standard_m64ms",
            "standard_m128",
            "standard_m128m",
            "standard_m128ms",
            "standard_m128s",

            "standard_m208ms_v2",
            "standard_m208s_v2",
            "standard_m416ms_v2",
            "standard_m416s_v2"
        ],
        gpu: [
            "standard_nc6",
            "standard_nc12",
            "standard_nc24",
            "standard_nc24r",

            "standard_nc6_promo",
            "standard_nc12_promo",
            "standard_nc24_promo",
            "standard_nc24r_promo",

            "standard_nc6s_v2",
            "standard_nc12s_v2",
            "standard_nc24s_v2",
            "standard_nc24rs_v2",

            "standard_nc6s_v3",
            "standard_nc12s_v3",
            "standard_nc24s_v3",
            "standard_nc24rs_v3",

            "standard_nc4as_t4_v3",
            "standard_nc8as_t4_v3",
            "standard_nc16as_t4_v3",
            "standard_nc64as_t4_v3",

            "standard_nd6s",
            "standard_nd12s",
            "standard_nd24s",
            "standard_nd24rs",

            "standard_nd96asr_v4",

            "standard_nv6",
            "standard_nv12",
            "standard_nv24",

            "standard_nv6_promo",
            "standard_nv12_promo",
            "standard_nv24_promo",

            "standard_nv12s_v3",
            "standard_nv24s_v3",
            "standard_nv48s_v3",

            "standard_nv4as_v4",
            "standard_nv8as_v4",
            "standard_nv16as_v4",
            "standard_nv32as_v4"
        ],
        hpc: [
            "standard_a8_v2",
            "standard_a8m_v2",
            "^standard_h[0-9a-z]*$",
            "^standard_h[0-9a-z]*_promo$",
            "^standard_h[bc][0-9a-z]*$",
            "^standard_h[bc][0-9a-z]*_promo*$",
            "^standard_h[bc][0-9a-z]*_[v2]*$",
            "^standard_h[bc][0-9a-z]*_[v2]*_promo*$",
            "standard_hb60rs",
            "standard_hc44rs",
            "standard_hb120rs_v3",
            "standard_hb120_16rs_v3",
            "standard_hb120_32rs_v3",
            "standard_hb120_64rs_v3",
            "standard_hb120_96rs_v3"
        ],
        standard: [
            "^standard_a[0-9a-z]*$",
            "^standard_d[0-9a-z]*$",
            "^basic_a[0-9a-z]*$",
            "small",
            "medium",
            "large",
            "extralarge",
            "^a[1-9][0-9]*$"
        ],
        storage: [
            "^standard_l[0-9]*s_v2*$"
        ],
        fpga: [
            "standard_np10s",
            "standard_np20s",
            "standard_np40s"
        ]
    })

    // delete bc you can get this information directly through API
    public additionalVmSizeCores = {
        extrasmall: 1,
        small: 1,
        medium: 2,
        large: 4,
        extralarge: 8,
    };

    private _destroy = new Subject();

    constructor(
        private arm: ArmHttpService,
        accountService: BatchAccountService) {

        this.cloudServiceSizes = accountService.currentAccount.pipe(
            takeUntil(this._destroy),
            switchMap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    return of(null);
                } else {
                    const cloudServiceUrl = `${supportedSkusUrl(account.subscription.subscriptionId, account.location)}/cloudServiceSkus?api-version=2021-06-01`
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

        this.sizes = combineLatest([this.cloudServiceSizes, this.virtualMachineSizes]).pipe(
            map(([cloudServiceSizes, virtualMachineSizes]) => {
                if (cloudServiceSizes && !virtualMachineSizes) {
                    return cloudServiceSizes;
                } else if (!cloudServiceSizes && virtualMachineSizes) {
                    return virtualMachineSizes;
                } else if (!cloudServiceSizes && !virtualMachineSizes) {
                    return null;
                }
                return cloudServiceSizes.merge(virtualMachineSizes);
            }),
            publishReplay(1),
            refCount(),
        );
    }

    public ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
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
                return mapResourceSkuToVmSize(response.value);
            }),
            catchError((error) => {
                log.error("Error loading vm sizes for account ", { account: account.toJS(), error });
                return of(null);
            }),
        );
    }
}
