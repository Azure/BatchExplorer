import { Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { AccountResource } from "app/models";
import { AccountParams, AccountService } from "app/services";
import { RxEntityProxy } from "app/services/core";
import { DeleteAccountDialogComponent } from "../action/delete-account-dialog.component";

@Component({
    selector: "bl-account-details",
    templateUrl: "account-details.html",
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({id}) {
        let name = "";
        if (id) {
            const split = id.split("/");
            name = split[split.length - 1];
        }
        return { name: name, label: "Account" };
    }
    public account: AccountResource;
    public data: RxEntityProxy<AccountParams, AccountResource>;

    public set accountId(id: string) {
        this._accountId = id;
        this.data.params = { id };
        this.data.fetch();
        this.selectAccount(id);
    }

    public get accountId() {
        return this._accountId;
    }

    private _accountId: string;
    private _paramsSubscriber: Subscription;

    constructor(
        private dialog: MdDialog,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
        private zone: NgZone,
        private viewContainerRef: ViewContainerRef) {
        this.data = accountService.getAccount(null);
        this.data.item.subscribe(account => this.account = account);

    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe(params => this.accountId = params["id"]);
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    public deleteAccount() {
        if (!this.account) {
            return;
        }
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DeleteAccountDialogComponent, config);
        dialogRef.componentInstance.accountId = this.accountId;
        dialogRef.componentInstance.accountName = this.account.name;
        dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(["/accounts"]);
        });
    }

    public selectAccount(accountId: string): void {
        this.accountService.selectAccount(accountId);
    }
}
