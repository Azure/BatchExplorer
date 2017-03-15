import { Injectable } from "@angular/core";
import { remote } from "electron";
import { Observable } from "rxjs";

import { AccountResource } from "app/models";
import { AccountService } from "./account-service";
import { AdalService } from "./adal";

const batchClientFactory = (<any>remote.getCurrentWindow()).batchClientFactory;

@Injectable()
export class BatchClientService {
    private _currentAccount: AccountResource;

    constructor(private adal: AdalService, private accountService: AccountService) {
        accountService.currentAccount.subscribe((account) => {
            this._currentAccount = account;
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccount) {
            throw "No account currently selected....";
        }

        return this.adal.accessToken.map((token) => {
            return this.getForAADToken(this._currentAccount.properties.accountEndpoint, token);
        }).share();
    }

    public getForAADToken(accountUrl: string, token: string) {
        return batchClientFactory.getForAADToken(accountUrl, token);
    }

    public getForSharedKey(accountUrl: string, token: string) {
        return batchClientFactory.getForSharedKey(accountUrl, token);
    }
}
