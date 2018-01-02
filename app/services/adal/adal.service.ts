import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AADService } from "client/core/aad";
import { AccessTokenCache } from "client/core/aad/access-token/access-token-cache";
import { AccessToken } from "client/core/aad/access-token/access-token.model";
import { Constants } from "common";
import { ElectronRemote } from "../electron";

const defaultResource = Constants.AAD.defaultResource;

@Injectable()
export class AdalService {
    private aadService: AADService;
    private tokenCache = new AccessTokenCache();
    private _waitingPromises: StringMap<Promise<AccessToken>> = {};

    constructor(remote: ElectronRemote) {
        this.aadService = remote.getBatchLabsApp().aadService;
    }

    public logout() {
        this.aadService.logout();
        this._waitingPromises = {};
    }

    public get tenantsIds() {
        return this.aadService.tenantsIds;
    }

    public get currentUser() {
        return this.aadService.currentUser;
    }

    public accessTokenFor(tenantId: string, resource: string = defaultResource) {
        return Observable.fromPromise(this.aadService.accessTokenData(tenantId, resource).then(x => x.access_token));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public accessTokenData(tenantId: string, resource: string = defaultResource): Observable<AccessToken> {
        return Observable.fromPromise(this.accessTokenDataAsync(tenantId, resource));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public async accessTokenDataAsync(tenantId: string, resource: string = defaultResource): Promise<AccessToken> {
        const key = `${tenantId}/${resource}`;
        if (key in this._waitingPromises) {
            return this._waitingPromises[key];
        }
        if (this.tokenCache.hasToken(tenantId, resource)) {
            const token = this.tokenCache.getToken(tenantId, resource);
            if (!token.expireInLess(Constants.AAD.refreshMargin)) {
                return token;
            }
        }

        const promise = this.aadService.accessTokenData(tenantId, resource).then((x) => {
            const token = new AccessToken({ ...x });
            this.tokenCache.storeToken(tenantId, resource, token);
            delete this._waitingPromises[key];
            return token;
        });
        this._waitingPromises[key] = promise;
        return promise;
    }
}
