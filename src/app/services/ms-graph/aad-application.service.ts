import { Injectable } from "@angular/core";
import { DataCache, ListOptionsAttributes, ListView } from "@batch-flask/core";
import { SecureUtils } from "@batch-flask/utils";
import { AADApplication, PasswordCredential, PasswordCredentialAttributes } from "app/models/ms-graph";
import { Observable } from "rxjs";
import { flatMap, map, shareReplay } from "rxjs/operators";
import {
    AADGraphEntityGetter, AADGraphHttpService, AADGraphListGetter,
} from "./core";

export interface AADApplicationListParams {
    owned?: boolean;
}

export interface AADApplicationParams {
    id: string;
}

export interface ApplicationCreateParams {
    name?: string;
    secret?: SecretParams;
}

export interface SecretParams {
    /**
     * Description for the secret.
     * @default "BatchExplorer secret"
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

@Injectable({providedIn: "root"})
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

    public create(application: ApplicationCreateParams): Observable<AADApplication> {
        const secretAttributes = this._builtSecret(application.secret);
        const name = application.name.replace(/ /g, "-");
        return this.aadGraph.post("/applications", {
            displayName: application.name,
            homepage: `https://${name}`,
            identifierUris: [`https://${name}`],
            availableToOtherTenants: false,
            passwordCredentials: [
                this._secretToParams(secretAttributes),
            ],
        }).pipe(
            map(response => new AADApplication({ ...response, passwordCredentials: [secretAttributes] })),
        );
    }

    public createSecret(appId: string, secret: SecretParams = {}, reset = false): Observable<PasswordCredential> {
        const secretAttributes = this._builtSecret(secret);
        return this.get(appId).pipe(
            flatMap((app) => {
                const existingKeys = reset ? [] : app.passwordCredentials.map((cred) => {
                    return cred._original;
                }).toJS();
                return this.aadGraph.patch(`/applicationsByAppId/${appId}`, {
                    passwordCredentials: [...existingKeys, this._secretToParams(secretAttributes)],
                });
            }),
            map(() => {
                return new PasswordCredential(secretAttributes);
            }),
            shareReplay(1),
        );
    }

    private _secretToParams(secret: PasswordCredentialAttributes) {
        return {
            customKeyIdentifier: secret.customKeyIdentifier,
            endDate: secret.endDate.toISOString(),
            keyId: secret.keyId,
            startDate: secret.startDate.toISOString(),
            value: secret.value,
        };
    }

    private _builtSecret(secret: SecretParams): PasswordCredentialAttributes {
        const startDate = new Date();
        const endDate = secret.endDate || new Date(2299, 12, 31);
        const name = secret.name || "BatchExplorer secret";
        const value = secret.value || SecureUtils.token();
        const customKeyIdentifier = btoa(name);
        const keyId = SecureUtils.uuid();

        return {
            customKeyIdentifier,
            endDate,
            keyId,
            startDate,
            value,
        };
    }
}
