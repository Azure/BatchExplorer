import { Injectable } from "@angular/core";
import { Subscription } from "app/models";
import { ArmProvider, ArmProviderAttributes, ArmProviderResourceType } from "app/models/arm-provider";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { AzureHttpService } from "../azure-http.service";
import { ArmListResponse } from "../core";

@Injectable({ providedIn: "root" })
export class ArmProviderService {

    constructor(
        private azure: AzureHttpService,
    ) { }

    /**
     * List all available providers
     * @param subscriptionId
     */
    public list(subscription: Subscription): Observable<ArmProvider[]> {
        const uri = `subscriptions/${subscription.subscriptionId}/providers`;
        return this.azure.get<ArmListResponse<ArmProviderAttributes>>(subscription, uri).pipe(
            map(response => response.value.map(x => new ArmProvider(x))),
        );
    }

    /**
     * Get a given provider
     * @param subscriptionId
     */
    public get(subscription: Subscription, provider: string): Observable<ArmProvider> {
        const uri = `subscriptions/${subscription.subscriptionId}/providers/${provider}`;
        return this.azure.get<ArmProviderAttributes>(subscription, uri).pipe(
            map(response => new ArmProvider(response)),
        );
    }

    /**
     * Get a given provider resource type
     * @param subscriptionId
     */
    public getResourceType(
        subscription: Subscription,
        provider: string,
        resource: string,
    ): Observable<ArmProviderResourceType | null> {
        return this.get(subscription, provider).pipe(
            map(provider => provider.resourceTypes.find(x => x.resourceType.toLowerCase() === resource.toLowerCase())),
            share(),
        );
    }
}
