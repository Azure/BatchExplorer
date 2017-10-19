import { Injectable } from "@angular/core";
import { BatchServiceClient } from "azure-batch-js";
import { TokenCredentials } from "ms-rest-js";
import { Observable } from "rxjs";

import { Constants } from "app/utils";
import { BatchClientProxy } from "client/api/batch-client-proxy/batch-client-proxy";
import { BatchClientProxyFactory } from "client/api/batch-client-proxy/batch-client-proxy-factory";
import { AccountService } from "./account.service";
import { AdalService } from "./adal";
import { ElectronRemote } from "./electron";

const factory = new BatchClientProxyFactory();
@Injectable()
export class BatchClientService {
    private _currentAccountId: string;
    private _batchClientFactory: BatchClientProxyFactory;

    constructor(private adal: AdalService, private accountService: AccountService, remote: ElectronRemote) {
        this._batchClientFactory = remote.getBatchClientFactory();
        accountService.currentAccountId.subscribe((id) => {
            this._currentAccountId = id;
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccountId) {
            throw new Error("No account currently selected....");
        }

        const resource = Constants.ResourceUrl.batch;
        return this.currentAccount.flatMap((account) => {
            return this.adal.accessTokenFor(account.subscription.tenantId, resource).map((token) => {
                const url = `https://${account.properties.accountEndpoint}`;
                return this.getForAADToken(url, token);
            });
        }).share();
    }

    public getTS(): Observable<BatchServiceClient> {
        if (!this._currentAccountId) {
            throw new Error("No account currently selected....");
        }

        const resource = Constants.ResourceUrl.batch;
        return this.currentAccount.flatMap((account) => {
            return this.adal.accessTokenFor(account.subscription.tenantId, resource).map((token) => {
                const url = `https://${account.properties.accountEndpoint}`;
                return this.getForAADToken(url, token);
            });
        }).share();
    }

    public getForAADToken(accountUrl: string, token: string): BatchClientProxy {
        return factory.getForAADToken(accountUrl, token);
    }

    public getForAADTokenTS(accountUrl: string, token: string): BatchClientProxy {
        return new BatchServiceClient(new TokenCredentials(token, "Bearer"), accountUrl);
    }

    public getForSharedKey(options: any) {
        return this._batchClientFactory.getForSharedKey(options);
    }

    private get currentAccount() {
        return this.accountService.currentAccount.filter(x => Boolean(x)).first();
    }
}
