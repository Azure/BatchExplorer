import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import { AccountKeys, AccountResource } from "app/models";
import { AccountService, ResourceAccessService } from "app/services";
import { Observable } from "rxjs";
import "./batch-account-keys-dialog.scss";

@Component({
    selector: "bl-batch-account-keys-dialog",
    templateUrl: "batch-account-keys-dialog.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatchAccountKeysDialogComponent {
    public keys: AccountKeys;
    public account: AccountResource;
    public loading = true;
    public set accountId(accountId: string) {
        const changed = accountId !== this._accountId;
        this._accountId = accountId;
        if (accountId && changed) {
            this._loadDetails();
        }
        this.changeDetector.detectChanges();
    }
    public get accountId() { return this._accountId; }

    private _accountId: string;

    constructor(
        resourceAccessService: ResourceAccessService,
        private accountService: AccountService,
        private changeDetector: ChangeDetectorRef) {
        resourceAccessService.listRolesForCurrentAccount().subscribe((roles) => {
            console.log("Account roles are", roles.toJS());
        });
    }

    private _loadDetails() {
        this.loading = true;
        Observable.forkJoin(
            this.accountService.get(this.accountId),
            this.accountService.getAccountKeys(this.accountId)).subscribe(([account, keys]) => {
                this.account = account;
                this.keys = keys;
                this.loading = false;
                this.changeDetector.markForCheck();
            });
    }
}
