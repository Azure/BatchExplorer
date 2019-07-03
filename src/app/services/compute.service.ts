import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { ArmBatchAccount, Resource } from "app/models";
import { Observable, empty } from "rxjs";
import { expand, flatMap, map, mergeMap, reduce, share, switchAll, tap } from "rxjs/operators";
import { ArmHttpService } from "./arm-http.service";
import { AzureHttpService } from "./azure-http.service";
import { BatchAccountService } from "./batch-account";
import { ArmListResponse } from "./core";
import { SubscriptionService } from "./subscription";

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
const computeGalleryProvider = computeProvider + "/galleries";
const computeGalleryImageProvider = computeProvider + "/galleries/images";
const computeGalleryImageVersionProvider = computeProvider + "/galleries/images/versions";

@Injectable({providedIn: "root"})
export class ComputeService {
public number;
    constructor(
        private arm: ArmHttpService,
        private accountService: BatchAccountService,
        private azure: AzureHttpService,
        private subscriptionService: SubscriptionService) {
    }

    public getQuotas(): Observable<ComputeUsage[]> {
        return this.accountService.currentAccount.pipe(
            tap((account) => {
                if (!(account instanceof ArmBatchAccount)) {
                    throw new ServerError({
                        code: "LocalBatchAccount",
                        message: "Cannot get quotas for a local batch account",
                        status: 406,
                    });
                }
            }),
            flatMap((account: ArmBatchAccount) => {
                const { subscription, location } = account;

                const url = `${computeUrl(subscription.subscriptionId)}/locations/${location}/usages`;
                return this.arm.get<ArmListResponse<ComputeUsage>>(url).pipe(map((response) => response.value));
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
        const params = new HttpParams()
            .set("$filter", `resourceType eq '${computeImageProvider}' and location eq '${location}'`);
        const options = { params };

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get<ArmListResponse>(subscription, resourceUrl(subscriptionId), options).pipe(
                    expand(obs => {
                        return obs.nextLink ? this.azure.get(subscription, obs.nextLink, options) : empty();
                    }),
                    reduce((images, response: ArmListResponse<Resource>) => {
                        return [...images, ...response.value];
                    }, []),
                );
            }),
            share(),
        );
    }

    public listSIG(subscriptionId: string, location: string): Observable<Resource[]> {
        // const sigImages = this._listSIGGalleries(subscriptionId, location).pipe(
        //     mergeMap(galleries => galleries.map(
        //         gallery => this._listSIGImages(subscriptionId, location, gallery.name).pipe(
        //             mergeMap(images => images.map(
        //                 image => this._listSIGImageVersions(subscriptionId, location, image.name).pipe(
        //                     map(versions => versions.map(
        //                         version => this._createSIGResource(gallery, image, version),
        //                     ),
        // )))))))).pipe(
        //     switchAll(),
        //     switchAll(),
        // );
        // return sigImages;
        const params = new HttpParams()
            .set("$filter", `resourceType eq '${computeGalleryImageVersionProvider}' and location eq '${location}'`);
        const options = { params };

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get<ArmListResponse>(subscription, resourceUrl(subscriptionId), options).pipe(
                    expand(obs => {
                        return obs.nextLink ? this.azure.get(subscription, obs.nextLink, options) : empty();
                    }),
                    reduce((images, response: ArmListResponse<Resource>) => {
                        return [...images, ...response.value];
                    }, []),
                );
            }),
            share(),
        );
    }

    // private _createSIGResource(gallery: Resource, image: Resource, version: Resource) {
    //     const resource = version;
    //     resource.name = gallery.name + ":" + image.name + ":" + version.name;
    //     return resource;
    // }

    private _listSIGImageVersions(subscriptionId: string, location: string, imageName: string): Observable<Resource[]> {
        const params = new HttpParams()
            .set("$filter", `resourceType eq '${computeGalleryImageVersionProvider}' and location eq '${location}'`);
        const options = { params };

        return this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                return this.azure.get<ArmListResponse>(subscription, resourceUrl(subscriptionId), options).pipe(
                    expand(obs => {
                        return obs.nextLink ? this.azure.get(subscription, obs.nextLink, options) : empty();
                    }),
                    reduce((images, response: ArmListResponse<Resource>) => {
                        return [...images, ...response.value];
                    }, []),
                );
            }),
            share(),
        );
    }

    // private _listSIGGalleries(subscriptionId: string, location: string): Observable<Resource[]> {
    //     const params = new HttpParams()
    //         .set("$filter", `resourceType eq '${computeGalleryProvider}' and location eq '${location}'`);
    //     const options = { params };

    //     return this.subscriptionService.get(subscriptionId).pipe(
    //         flatMap((subscription) => {
    //             return this.azure.get<ArmListResponse>(subscription, resourceUrl(subscriptionId), options).pipe(
    //                 expand(obs => {
    //                     return obs.nextLink ? this.azure.get(subscription, obs.nextLink, options) : empty();
    //                 }),
    //                 reduce((images, response: ArmListResponse<Resource>) => {
    //                     return [...images, ...response.value];
    //                 }, []),
    //             );
    //         }),
    //         share(),
    //     );
    // }

    // private _listSIGImages(subscriptionId: string, location: string, galleryName: string): Observable<Resource[]> {
    //     const params = new HttpParams()
    //         .set("$filter", `resourceType eq '${computeGalleryImageProvider}' and location eq '${location}'`);
    //     const options = { params };

    //     return this.subscriptionService.get(subscriptionId).pipe(
    //         flatMap((subscription) => {
    //             return this.azure.get<ArmListResponse>(subscription, resourceUrl(subscriptionId), options).pipe(
    //                 expand(obs => {
    //                     return obs.nextLink ? this.azure.get(subscription, obs.nextLink, options) : empty();
    //                 }),
    //                 reduce((images, response: ArmListResponse<Resource>) => {
    //                     return [...images, ...response.value];
    //                 }, []),
    //             );
    //         }),
    //         share(),
    //     );
    // }

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
