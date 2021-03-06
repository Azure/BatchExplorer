import { Injectable } from "@angular/core";
import { ArmLocation, ArmLocationAttributes, ArmSubscription } from "app/models";
import { Observable, forkJoin } from "rxjs";
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
    public list(subscription: ArmSubscription): Observable<ArmLocation[]> {
        const uri = `subscriptions/${subscription.subscriptionId}/locations`;
        return this.azure.get<ArmListResponse<ArmLocationAttributes>>(subscription, uri).pipe(
            map(response => response.value.map(x => new ArmLocation(x))),
        );
    }

    public listForResourceType(
        subscription: ArmSubscription,
        provider: string,
        resource: string,
    ): Observable<ArmLocation[]> {
        return forkJoin(
            this.list(subscription),
            this.armProviderService.getResourceType(subscription, provider, resource),
        ).pipe(
            map(([baseLocations, resourceType]) => {
                if (!resourceType) {
                    return baseLocations;
                }
                const locationMap = this._createLocationMap(baseLocations);

                return resourceType.locations.map((displayName) => {
                    return this._createLocationFromDisplayName(subscription.subscriptionId, displayName, locationMap);
                }).toArray();
            }),
            share(),
        );
    }

    private _createLocationFromDisplayName(
        subscriptionId: string,
        displayName: string,
        locationMap: Map<string, ArmLocation>,
    ): ArmLocation {
        const name = displayName.toLowerCase().replace(/ /g, ""); // Name is all lowercase without spaces
        const location = locationMap.get(name);
        if (location) { return location; }
        return new ArmLocation({
            id: `/subscriptions/${subscriptionId}/locations/${name}`,
            name,
            displayName,
        });
    }

    private _createLocationMap(locations: ArmLocation[]): Map<string, ArmLocation> {
        const map = new Map<string, ArmLocation>();
        for (const location of locations) {
            map.set(location.name, location);
        }
        return map;
    }
}
