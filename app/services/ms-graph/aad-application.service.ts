import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AADApplication } from "app/models/ms-graph";
import { DataCache, ListOptionsAttributes, ListView } from "app/services/core";
import { SecureUtils } from "app/utils";
import { AADGraphHttpService, MsGraphEntityGetter, MsGraphHttpService, MsGraphListGetter } from "./core";

export interface AADApplicationListParams {
    owned?: boolean;
}

export interface AADApplicationParams {
    id: string;
}

@Injectable()
export class AADApplicationService {
    private _getter: MsGraphEntityGetter<AADApplication, AADApplicationParams>;
    private _listGetter: MsGraphListGetter<AADApplication, AADApplicationListParams>;
    private _cache = new DataCache<AADApplication>();

    constructor(private aadGraph: AADGraphHttpService, msGraph: MsGraphHttpService) {
        this._getter = new MsGraphEntityGetter(AADApplication, msGraph, {
            cache: () => this._cache,
            uri: ({ id }) => `/applications/${id}`,
        });

        this._listGetter = new MsGraphListGetter(AADApplication, msGraph, {
            cache: () => this._cache,
            uri: ({ owned }) => {
                if (owned) {
                    return `/me/ownedObjects/$/microsoft.graph.application`;
                } else {
                    return `/applications`;
                }
            },
        });
    }

    /**
     * @returns principal with given id
     */
    public get(principalId: string): Observable<AADApplication> {
        return this._getter.fetch({ id: principalId });
    }

    public listView(options: ListOptionsAttributes = {}): ListView<AADApplication, AADApplicationListParams> {
        return new ListView({
            cache: () => this._cache,
            getter: this._listGetter,
            initialOptions: options,
        });
    }

    public listAllOwned() {
        this._listGetter.fetchAll({ owned: true });
    }

    public createSecret(appId: string, name: string) {
        const startDate = new Date();
        const endDate = new Date(2299, 12, 31);
        return this.get(appId).flatMap((app) => {
            const existingKeys = app.passwordCredentials.map((cred) => {
                return { keyId: cred.keyId };
            }).toJS();
            return this.aadGraph.patch(`/applicationsByAppId/${appId}`, {
                passwordCredentials: [...existingKeys, {
                    customKeyIdentifier: btoa(name),
                    endDate: endDate.toISOString(),
                    keyId: SecureUtils.uuid(),
                    startDate: startDate.toISOString(),
                    value: SecureUtils.token(),
                }],
            });
        }).shareReplay(1);
    }

}
