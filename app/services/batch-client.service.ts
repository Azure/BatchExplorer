import { Injectable } from "@angular/core";
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

    constructor(private adal: AdalService, private accountService: AccountService, remote: ElectronRemote) {
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

    public getForAADToken(accountUrl: string, token: string): BatchClientProxy {
        return factory.getForAADToken(accountUrl, token);
    }

    public getForSharedKey(options: any) {
        return factory.getForSharedKey(options);
    }

    private get currentAccount() {
        return this.accountService.currentAccount.filter(x => Boolean(x)).first();
    }
}
