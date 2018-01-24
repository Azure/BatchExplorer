import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AccountService } from "../account.service";
import { ArmHttpService } from "../arm-http.service";

export enum ProviderType {
    Network = "Network",
    ClassicNetwork = "ClassicNetwork",
}

export interface VirtualNetwork {
    id: string;
    location: string;
    name: string;
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
    constructor(private accountService: AccountService, private armService: ArmHttpService) {
    }

    /**
     * Get ARM virtual network observable
     */
    public virtualNetwork(): Observable<VirtualNetwork[]> {
        return this._getCurrentAccount().flatMap(account => {
            const type = ProviderType.Network;
            const url = this._getNetworkUrl(account.subscriptionId, type);
            return this.armService.get(url).flatMap(response => {
                const virtualNetworks = response.json();
                if (!virtualNetworks || !virtualNetworks.value) {
                    return Observable.of(null);
                }
                return Observable.of(this._filterByLocation(virtualNetworks.value, account.location, type));
            });
        }).share();
    }

    /**
     * Get classic virtual network observable
     */
    public classicVirtualNetwork(): Observable<VirtualNetwork[]> {
        return this._getCurrentAccount().flatMap(account => {
            const type = ProviderType.ClassicNetwork;
            const url = this._getNetworkUrl(account.subscriptionId, type);
            return this.armService.get(url).flatMap(response => {
                const virtualNetworks = response.json();
                if (!virtualNetworks || !virtualNetworks.value) {
                    return Observable.of(null);
                }
                return Observable.of(this._filterByLocation(virtualNetworks.value, account.location, type));
            });
        }).share();
    }

    /**
     * Get account observable for retriving subscription id and location
     */
    private _getCurrentAccount() {
        return this.accountService.currentAccount.flatMap(account => {
            const subscription = account && account.subscription;
            if (!subscription) {
                return Observable.of(null);
            }
            return Observable.of({
                subscriptionId: subscription.subscriptionId,
                location: account.location,
            });
        }).share();
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
