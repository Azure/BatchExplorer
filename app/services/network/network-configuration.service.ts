import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { first, flatMap } from "rxjs/operators";
import { ArmHttpService } from "../arm-http.service";

export enum ProviderType {
    Network = "Network",
    ClassicNetwork = "ClassicNetwork",
}

export interface VirtualNetwork {
    id: string;
    location: string;
    name: string;
    category: "ARM" | "Classic";
    subnets: Subnet[];
}

export interface Subnet {
    id: string;
    name: string;
}

/**
 * Wrapper around the http service so call the azure ARM network api.
 * Set the Authorization header and the api version
 */
@Injectable()
export class NetworkConfigurationService {
    constructor(private armService: ArmHttpService) {
    }

    /**
     *
     * Get ARM virtual network observable by subscriptionId and filter by location
     * @param subscriptionId
     * @param location
     */
    public listArmVirtualNetworks(subscriptionId: string, location: string): Observable<VirtualNetwork[]> {
        const type = ProviderType.Network;
        const url = this._getNetworkUrl(subscriptionId, type);
        return this.armService.get(url).pipe(
            flatMap(response => {
                const virtualNetworks = response.json();
                if (!virtualNetworks || !virtualNetworks.value) {
                    return of(null);
                }
                return of(this._filterByLocation(virtualNetworks.value, location, type));
            }),
            first(),
        );
    }

    /**
     * Get classic virtual network observable by subscriptionId and filter by location
     * @param subscriptionId
     * @param location
     */
    public listClassicVirtualNetworks(subscriptionId: string, location: string): Observable<VirtualNetwork[]> {
        const type = ProviderType.ClassicNetwork;
        const url = this._getNetworkUrl(subscriptionId, type);
        return this.armService.get(url).pipe(
            flatMap(response => {
                const virtualNetworks = response.json();
                if (!virtualNetworks || !virtualNetworks.value) {
                    return of(null);
                }
                return of(this._filterByLocation(virtualNetworks.value, location, type));
            }),
            first(),
        );
    }

    /**
     * List virtual network url
     * @param subscriptionId
     * @param provider
     */
    private _getNetworkUrl(subscriptionId: string, provider: ProviderType) {
        return `/subscriptions/${subscriptionId}/providers/Microsoft.${provider}/virtualNetworks`;
    }

    /**
     * Custom function that filters virtual network result by location
     * @param virtualNetworks
     * @param location
     * @param provider
     */
    private _filterByLocation(virtualNetworks: any[], location: string, provider: ProviderType): VirtualNetwork[] {
        return virtualNetworks.filter(network => network.location === location)
            .map(object => {
                return {
                    id: object.id,
                    name: object.name,
                    location: object.location,
                    category: provider === ProviderType.Network ? "ARM" : "Classic",
                    subnets: object.properties.subnets.map(subnet => {
                        const subnetId = provider === ProviderType.Network ?
                            subnet.id : this._getClassicVnetSubnetId(object.id, subnet.name);
                        return {
                            id: subnetId,
                            name: subnet.name,
                        } as Subnet;
                    }),
                } as VirtualNetwork;
            });
    }

    /**
     * Helper function that constructs subnetId for classic vnet because response has no id property
     * @param vnetId
     * @param subnetName
     */
    private _getClassicVnetSubnetId(vnetId: string, subnetName: string): string {
        return `${vnetId}/subnets/${subnetName}`;
    }
}
