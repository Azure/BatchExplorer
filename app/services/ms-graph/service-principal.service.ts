import { Injectable } from "@angular/core";
import { ServicePrincipal } from "app/models/ms-graph";
import { DataCache } from "app/services/core";
import { Observable } from "rxjs";
import { MsGraphEntityGetter } from "./core/ms-graph-entity-getter";
import { MsGraphHttpService } from "./core/ms-graph-http.service";

export interface ServicePrincipalParams {
    id: string;
}

@Injectable()
export class ServicePrincipalService {
    private _getter: MsGraphEntityGetter<ServicePrincipal, ServicePrincipalParams>;
    private _cache = new DataCache<ServicePrincipal>();

    constructor(msGraph: MsGraphHttpService) {
        this._getter = new MsGraphEntityGetter(ServicePrincipal, msGraph, {
            cache: () => this._cache,
            uri: ({ id }) => `/servicePrincipals/${id}`,
        });

    }

    /**
     * @returns principal with given id
     */
    public get(principalId: string): Observable<any> {
        return this._getter.fetch({ id: principalId });
    }
}
