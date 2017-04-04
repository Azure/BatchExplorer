import { Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Observable, Subscription } from "rxjs";

import { AccountResource } from "app/models";
import { AccountService } from "app/services";

@Component({
    selector: "bl-account-details",
    templateUrl: "account-details.html",
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
    public static breadcrumb({ id }) {
        let name = "";
        if (id) {
            const split = id.split("/");
            name = split[split.length - 1];
        }
        return { name: name, label: "Account" };
    }
    public account: AccountResource;

    public accountId: string;
    public loading: boolean = true;
    public loadingError: any;

    private _paramsSubscriber: Subscription;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
        private zone: NgZone,
        private viewContainerRef: ViewContainerRef) {

    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe(params => {
            this.accountId = params["id"];
            this.selectAccount(this.accountId);
            this.loading = true;
            this.accountService.getAccount(this.accountId).subscribe({
                next: (x) => {
                    this.account = x;
                    this.loading = false;
                },
                error: (error) => {
                    this.loadingError = error;
                },
            });
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
    }

    @autobind()
    public refresh() {
        // TODO: this.accountService.refresh(accountId)
        return Observable.of({});
    }

    public selectAccount(accountId: string): void {
        this.accountService.selectAccount(accountId);
    }
}
