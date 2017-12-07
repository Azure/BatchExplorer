import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { ElectronRemote } from "app/services";
import { AADService } from "client/core/aad";
import { AccessToken } from "client/core/aad/access-token";

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
