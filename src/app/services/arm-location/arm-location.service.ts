import { Injectable } from "@angular/core";
import { Location, LocationAttributes, Subscription } from "app/models";
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
    public list(subscription: Subscription): Observable<Location[]> {
        const uri = `subscriptions/${subscription.subscriptionId}/locations`;
        return this.azure.get<ArmListResponse<LocationAttributes>>(subscription, uri).pipe(
            map(response => response.value.map(x => new Location(x))),
        );
    }

    public listForResourceType(subscription: Subscription, provider: string, resource: string): Observable<Location[]> {
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
        locationMap: Map<string, Location>,
    ): Location {
        const name = displayName.toLowerCase().replace(/ /g, ""); // Name is all lowercase without spaces
        const location = locationMap.get(name);
        if (location) { return location; }
        return new Location({
            id: `/subscriptions/${subscriptionId}/locations/${name}`,
            name,
            displayName,
        });
    }

    private _createLocationMap(locations: Location[]): Map<string, Location> {
        const map = new Map<string, Location>();
        for (const location of locations) {
            map.set(location.name, location);
        }
        return map;
    }
}
