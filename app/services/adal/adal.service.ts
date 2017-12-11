import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AADService } from "client/core/aad";
import { AccessToken } from "client/core/aad/access-token";
import { ElectronRemote } from "../electron";

@Injectable()
export class AdalService {
    private aadService: AADService;

    constructor(remote: ElectronRemote) {
        this.aadService = remote.getBatchLabsApp().aadService;
    }

    public init() {
        // TODO-TIM something?
    }

    public logout() {
        this.aadService.logout();
    }

    public get tenantsIds() {
        return this.aadService.tenantsIds;
    }

    public get currentUser() {
        return this.aadService.currentUser;
    }

    public accessTokenFor(tenantId: string, resource?: string) {
        return Observable.fromPromise(this.aadService.accessTokenFor(tenantId, resource));
    }

    /**
     *
     * @param tenantId
     * @param resource
     */
    public accessTokenData(tenantId: string, resource?: string): Observable<AccessToken> {
        return Observable.fromPromise(this.aadService.accessTokenData(tenantId, resource));

    }
}
