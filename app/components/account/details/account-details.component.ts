import { Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { Account } from "app/models";
import { AccountService } from "app/services";
import { DeleteAccountDialogComponent } from "../action/delete-account-dialog.component";

@Component({
    selector: "bex-account-details",
    templateUrl: "account-details.html",
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
    public account: Account;

    public set accountId(id: string) {
        this._accountId = id;
        this.accountService.get(id).subscribe((account) => {
            this.account = account;
            if (account) {
                this.zone.run(() => {
                    this.accountService.selectAccount(account);
                });
            }
        });
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

    public selectAccount(account: Account): void {
        this.accountService.selectAccount(account);
    }
}
