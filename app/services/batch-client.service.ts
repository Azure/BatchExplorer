import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { Constants } from "app/utils";
import { BatchClientProxyFactory, SharedKeyOptions } from "client/api";
import { AccountService } from "./account.service";
import { AdalService } from "./adal";
import { ElectronRemote } from "./electron";

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

    public getForAADToken(accountUrl: string, token: string) {
        return this._batchClientFactory.getForAADToken(accountUrl, token);
    }

    public getForSharedKey(options: SharedKeyOptions) {
        return this._batchClientFactory.getForSharedKey(options);
    }

    private get currentAccount() {
        return this.accountService.currentAccount.filter(x => Boolean(x)).first();
    }
}
