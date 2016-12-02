import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MdDialog, MdDialogConfig } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs/Subscription";

import { DeleteAccountDialogComponent } from "../action/delete-account-dialog.component";
import { Account } from "app/models";
import { AccountService } from "app/services";

// put this template into a separate template file.

@Component({
    selector: "bex-account-details",
    template: require("./account-details.html"),
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
    public account: Account;

    public set accountName(name: string) {
        this._accountName = name;
        this.accountService.get(name).subscribe((account) => this.account = account);
    }

    public get accountName() {
        return this._accountName;
    }

    private _accountName: string;
    private _paramsSubscriber: Subscription;

    constructor(
        private dialog: MdDialog,
        private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
        private viewContainerRef: ViewContainerRef) {

    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe(params => this.accountName = params["name"]);
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    public deleteAccount() {
        let config = new MdDialogConfig();
        config.viewContainerRef = this.viewContainerRef;

        const dialogRef = this.dialog.open(DeleteAccountDialogComponent, config);
        dialogRef.componentInstance.accountName = this.accountName;
    }

    public selectAccount(account: Account): void {
        this.accountService.selectAccount(account);
    }
}
