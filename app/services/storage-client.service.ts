import { Injectable } from "@angular/core";
import { StorageAccountSharedKeyOptions, StorageClientProxyFactory } from "client/api";
import { Observable } from "rxjs";
import { AccountService } from "./account.service";
import { AdalService } from "./adal";
import { ElectronRemote } from "./electron";

@Injectable()
export class StorageClientService {
    private _currentAccountId: string;
    private _storageClientFactory: StorageClientProxyFactory;

    constructor(private adal: AdalService, private accountService: AccountService, private remote: ElectronRemote) {
        this._storageClientFactory = remote.getStorageClientFactory();

        // todo: change me to use the account not just the ID as we need the storageAccountId
        accountService.currentAccountId.subscribe((id) => {
            this._currentAccountId = id;
        });
    }

    public get(): Observable<any> {
        if (!this._currentAccountId) {
            throw "No account currently selected....";
        }

        // TODO: pretty sure this aint right, based on what is in the batch client service, but it could be :)
        // Need to read this from the accound and set an error condition if auto storage not available
        return Observable.of(this.getForSharedKey({
            account: "andrew1973",
            key: "TrQHCI9J3+U/4mbKQU6k0wLGIbfo/M8J5p9RfWllVSaOyHDMm18Um/hkhEDPDJI2Sl+4cQtfFLCQ0/riQ3102w==",
        }));
    }

    public getForSharedKey(options: StorageAccountSharedKeyOptions) {
        return this._storageClientFactory.getBlobServiceForSharedKey(options);
    }

    private get currentAccount() {
        return this.accountService.currentAccount.filter(x => Boolean(x)).first();
    }
}
