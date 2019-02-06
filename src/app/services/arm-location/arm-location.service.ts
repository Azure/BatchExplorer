import { Injectable } from "@angular/core";
import { Location, LocationAttributes, Subscription } from "app/models";
import { Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { ArmProviderService } from "../arm-provider";
import { AzureHttpService } from "../azure-http.service";
import { ArmListResponse } from "../core";

@Injectable({ providedIn: "root" })
export class ArmLocationService {
    constructor(
        private azure: AzureHttpService,
        private armProviderService: ArmProviderService,
    ) { }

    /**
     * List all available geo-locations for given subscription id
     * @param subscriptionId
     */
    public list(subscription: Subscription): Observable<Location[]> {
        const uri = `subscriptions/${subscription.subscriptionId}/locations`;
        return this.azure.get<ArmListResponse<LocationAttributes>>(subscription, uri).pipe(
            map(response => response.value.map(x => new Location(x))),
        );
    }

    public listForResourceType(subscription: Subscription, provider: string, resource: string): Observable<Location[]> {
        return this.armProviderService.getResourceType(subscription, provider, resource).pipe(
            map((resourceType) => {
                if (!resourceType) {
                    return [];
                }
                return resourceType.locations.map((displayName) => {
                    return this._createLocationFromDisplayName(subscription.subscriptionId, displayName);
                }).toArray();
            }),
            share(),
        );
    }

    private _createLocationFromDisplayName(subscriptionId: string, displayName: string): Location {
        const name = displayName.toLowerCase().replace(/ /g, ""); // Name is all lowercase without spaces
        return new Location({
            id: `/subscriptions/${subscriptionId}/locations/${name}`,
            name,
            displayName,
        });
    }
}
