import { Injectable } from "@angular/core";
import { ServicePrincipal } from "app/models/ms-graph";
import { DataCache, ListOptionsAttributes, ListView } from "@batch-flask/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AADGraphEntityGetter, AADGraphHttpService, AADGraphListGetter } from "./core";

export interface ServicePrincipalListParams {
    owned?: boolean;
}

export interface ServicePrincipalParams {
    id?: string;
    appId?: string;
}

export interface ServicePrincipalCreateParams {
    appId: string;
}
@Injectable()
export class ServicePrincipalService {
    private _getter: AADGraphEntityGetter<ServicePrincipal, ServicePrincipalParams>;
    private _listGetter: AADGraphListGetter<ServicePrincipal, ServicePrincipalListParams>;
    private _cache = new DataCache<ServicePrincipal>();

    constructor(private aadGraph: AADGraphHttpService) {
        this._getter = new AADGraphEntityGetter(ServicePrincipal, aadGraph, {
            cache: () => this._cache,
            uri: ({ id, appId }) => {
                if (id) {
                    return `/servicePrincipals/${id}`;
                } else {
                    return `/servicePrincipalsByAppId/${appId}`;
                }
            },
        });

        this._listGetter = new AADGraphListGetter(ServicePrincipal, aadGraph, {
            cache: () => this._cache,
            uri: ({ owned }) => {
                if (owned) {
                    return `/me/ownedObjects`;
                } else {
                    return `/servicePrincipals`;
                }
            },
            filter: (obj: any) => obj.objectType === "ServicePrincipal",
        });
    }

    /**
     * @returns principal with given id
     */
    public get(principalId: string): Observable<ServicePrincipal> {
        return this._getter.fetch({ id: principalId });
    }

    /**
     * @returns principal with given id
     */
    public getByAppId(appId: string): Observable<ServicePrincipal> {
        return this._getter.fetch({ appId });
    }

    public listView(options: ListOptionsAttributes = {}): ListView<ServicePrincipal, ServicePrincipalListParams> {
        return new ListView({
            cache: () => this._cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAllOwned() {
        this._listGetter.fetchAll({ owned: true });
    }

    public create(params: ServicePrincipalCreateParams): Observable<ServicePrincipal> {
        return this.aadGraph.post("/servicePrincipals", {
            appId: params.appId,
            accountEnabled: true,
        }).pipe(map(x => new ServicePrincipal(x)));
    }
}
