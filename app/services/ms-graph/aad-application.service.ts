import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AADApplication, PasswordCredential } from "app/models/ms-graph";
import { DataCache, ListOptionsAttributes, ListView } from "app/services/core";
import { SecureUtils } from "app/utils";
import {
    AADGraphEntityGetter, AADGraphHttpService, AADGraphListGetter,
} from "./core";

export interface AADApplicationListParams {
    owned?: boolean;
}

export interface AADApplicationParams {
    id: string;
}

export interface SecretParams {
    /**
     * Description for the secret.
     * @default "BatchLabs secret"
     */
    name?: string;

    /**
     * @default generate secret
     */
    value?: string;

    /**
     *
     */
    endDate?: Date;
}

@Injectable()
export class AADApplicationService {
    private _getter: AADGraphEntityGetter<AADApplication, AADApplicationParams>;
    private _listGetter: AADGraphListGetter<AADApplication, AADApplicationListParams>;
    private _cache = new DataCache<AADApplication>();

    constructor(private aadGraph: AADGraphHttpService) {
        this._getter = new AADGraphEntityGetter(AADApplication, aadGraph, {
            cache: () => this._cache,
            uri: ({ id }) => `/applicationsByAppId/${id}`,
        });

        this._listGetter = new AADGraphListGetter(AADApplication, aadGraph, {
            cache: () => this._cache,
            uri: ({ owned }) => {
                if (owned) {
                    return `/me/ownedObjects/$/Microsoft.DirectoryServices.Application`;
                } else {
                    return `/applications`;
                }
            },
            filter: (obj: any) => obj.objectType === "Application",
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

    public createSecret(appId: string, secret: SecretParams = {}, reset = false): Observable<PasswordCredential> {
        const startDate = new Date();
        const endDate = secret.endDate || new Date(2299, 12, 31);
        const name = secret.name || "BatchLabs secret";
        const value = secret.value || SecureUtils.token();
        const customKeyIdentifier = btoa(name);
        const keyId = SecureUtils.uuid();
        return this.get(appId).flatMap((app) => {
            const existingKeys = reset ? [] : app.passwordCredentials.map((cred) => {
                return cred._original;
            }).toJS();
            return this.aadGraph.patch(`/applicationsByAppId/${appId}`, {
                passwordCredentials: [...existingKeys, {
                    customKeyIdentifier,
                    endDate: endDate.toISOString(),
                    keyId,
                    startDate: startDate.toISOString(),
                    value,
                }],
            });
        }).map(() => {
            return new PasswordCredential({
                value,
                startDate,
                endDate,
                keyId,
                customKeyIdentifier,
            });
        }).shareReplay(1);
    }

}
