import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ServerError } from "@batch-flask/core";
import { ArmBatchAccount, ArmLocation, ArmLocationAttributes, Resource } from "app/models";
import { Observable, empty } from "rxjs";
import { combineAll, concatAll, expand, flatMap, map, reduce, share, tap } from "rxjs/operators";
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

export interface TargetRegion {
    name: string;
    regionalReplicaCount: number;
    storageAccountType: string;
}

export interface ArmSharedImageGalleryVersion {
    id: string;
    location: string;
    name: string;
    type: string;
    properties: {
        provisioningState: string;
        publishingProfile: {
            endOfLifeDate: string;
            excludeFromLatest: boolean;
            publishedDate: string;
            replicaCount: number;
            storageAccountType: string;
            source: {
                managedImage: {
                    id: string;
                },
            }
            targetRegions: TargetRegion[];
        };
        storageProfile: {
            osDiskImage: {
                sizeInGB: number;
                hostCaching: string;
            },
        };
    };
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
        const params = new HttpParams()
            .set("$filter", `resourceType eq '${computeGalleryImageVersionProvider}' and location eq '${location}'`);
        const options = { params };
        const x = this.subscriptionService.get(subscriptionId).pipe(
            flatMap((subscription) => {
                const locationsUri = `subscriptions/${subscription.subscriptionId}/locations`;
                return this.azure.get<ArmListResponse<ArmLocationAttributes>>(subscription, locationsUri).pipe(
                    map(response => response.value.map(x => new ArmLocation(x))),
                    flatMap(armLocations => armLocations.map(armLocation => {
                        if (armLocation.name === location) {
                            return this.azure.get<ArmListResponse>(
                                subscription, resourceUrl(subscriptionId), options).pipe(
                                    expand(obs => {
                                        return obs.nextLink ? this.azure.get(
                                            subscription, obs.nextLink, options) : empty();
                                    }),
                                    reduce((images: Resource[], response: ArmListResponse<Resource>) => {
                                        return [...images, ...response.value];
                                    }, []),
                                    flatMap(resources => resources.map(resource => {
                                        return this.azure.get<ArmSharedImageGalleryVersion>(
                                            subscription, resource.id).pipe(
                                                map(armResource => ({resource, armResource})),
                                            );
                                    })),
                                    combineAll(),
                                    map(resources => resources.filter(resource => {
                                            for (const region of
                                                resource.armResource.properties.publishingProfile.targetRegions) {
                                                console.log(`${region.name} === ${armLocation.displayName}`);
                                                if (region.name === armLocation.displayName) {
                                                    return true;
                                                }
                                            }
                                            return false;
                                    })),
                                    map(resources => resources.map(resource => resource.resource)),
                            );
                        }
                        return empty();
                    })),
                    concatAll(),
                    share(),
                );
            }),
        );
        return x;
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
