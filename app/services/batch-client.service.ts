import { Injectable } from "@angular/core";
import { remote } from "electron";
import { Observable } from "rxjs";
import { AccountService } from "./account.service";
import { AdalService } from "./adal";

const batchClientFactory = (<any>remote.getCurrentWindow()).batchClientFactory;

const resource = "https://batch.core.windows.net/";

@Injectable()
export class BatchClientService {
    private _currentAccountId: string;

    constructor(private adal: AdalService, private accountService: AccountService) {
        accountService.currentAccountId.subscribe((id) => {
            this._currentAccountId = id;
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccountId) {
            throw "No account currently selected....";
        }
        return Observable.combineLatest(this.adal.accessTokenFor(resource), this.currentAccount)
            .first()
            .map(([token, account]) => {
                const url = `https://${account.properties.accountEndpoint}`;
                return this.getForAADToken(url, token);
            }).share();
    }

    public getForAADToken(accountUrl: string, token: string) {
        return batchClientFactory.getForAADToken(accountUrl, token);
    }

    public getForSharedKey(accountUrl: string, token: string) {
        return batchClientFactory.getForSharedKey(accountUrl, token);
    }

    private get currentAccount() {
        return this.accountService.currentAccount.filter(x => Boolean(x)).first();
    }
}
