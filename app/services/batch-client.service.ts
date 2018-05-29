import { Injectable } from "@angular/core";
import { ElectronRemote } from "@batch-flask/ui";
import { Observable } from "rxjs";

import { AccountService } from "./account.service";
import { AdalService } from "./adal";
import { BatchClientProxy, BatchClientProxyFactory } from "./batch-api";
import { BatchLabsService } from "./batch-labs.service";

const factory = new BatchClientProxyFactory();

@Injectable()
export class BatchClientService {
    private _currentAccountId: string;

    constructor(
        private adal: AdalService,
        private accountService: AccountService,
        remote: ElectronRemote,
        private batchLabs: BatchLabsService) {

        accountService.currentAccountId.subscribe((id) => {
            this._currentAccountId = id;
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccountId) {
            throw new Error("No account currently selected....");
        }

        const resource = this.batchLabs.azureEnvironment.batchUrl;
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
