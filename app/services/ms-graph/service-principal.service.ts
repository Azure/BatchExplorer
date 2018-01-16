import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ServicePrincipal } from "app/models/ms-graph";
import { DataCache, ListOptionsAttributes, ListView } from "app/services/core";
import { MsGraphEntityGetter, MsGraphHttpService, MsGraphListGetter } from "./core";
// import {  } from "./core/ms-graph-http.service";

export interface ServicePrincipalListParams {
    owned?: boolean;
}

export interface ServicePrincipalParams {
    id: string;
}

@Injectable()
export class ServicePrincipalService {
    private _getter: MsGraphEntityGetter<ServicePrincipal, ServicePrincipalParams>;
    private _listGetter: MsGraphListGetter<ServicePrincipal, ServicePrincipalListParams>;
    private _cache = new DataCache<ServicePrincipal>();

    constructor(msGraph: MsGraphHttpService) {
        this._getter = new MsGraphEntityGetter(ServicePrincipal, msGraph, {
            cache: () => this._cache,
            uri: ({ id }) => `/servicePrincipals/${id}`,
        });

        this._listGetter = new MsGraphListGetter(ServicePrincipal, msGraph, {
            cache: () => this._cache,
            uri: ({ owned }) => {
                if (owned) {
                    return `/me/ownedObjects/$/microsoft.graph.servicePrincipal`;
                } else {
                    return `/servicePrincipals`;
                }
            },
        });
    }

    /**
     * @returns principal with given id
     */
    public get(principalId: string): Observable<ServicePrincipal> {
        return this._getter.fetch({ id: principalId });
    }

    public listView(options: ListOptionsAttributes = {}): ListView<ServicePrincipal, ServicePrincipalListParams> {
        return new ListView({
            cache: () => this._cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAllOwned() {
        this._listGetter.fetchAll({owned: true});
    }
}
