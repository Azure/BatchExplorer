import { Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { AccountResource, BatchApplication, Job, Pool } from "app/models";
import {
    AccountParams, AccountService, ApplicationService, JobService, PoolService, JobListParams, PoolListParams,
 } from "app/services";
import { EntityView, RxListProxy, ListView } from "app/services/core";

import "./account-details.scss";

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
    public loadingError: any;
    public noLinkedStorage: boolean = false;

    public data: EntityView<AccountResource, AccountParams>;

    public applicationData: RxListProxy<{}, BatchApplication>;
    public jobData: ListView<Job, JobListParams>;
    public poolData: ListView< Pool, PoolListParams>;

    private _paramsSubscriber: Subscription;
    private initialOptions = { maxItems: 10 };

    constructor(
        router: Router,
        private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
        private applicationService: ApplicationService,
        private jobService: JobService,
        private poolService: PoolService,
        zone: NgZone,
        viewContainerRef: ViewContainerRef) {
        this.data = this.accountService.view();
        this.data.item.subscribe((account) => {
            this.account = account;
            if (account) {
                this._loadQuickAccessLists();
            }
        });
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe(params => {
            this.accountId = params["id"];
            this.selectAccount(this.accountId);
            this.data.params = { id: this.accountId };
            this.data.fetch().subscribe({
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
        return this.data.refresh();
    }

    public selectAccount(accountId: string): void {
        this.noLinkedStorage = false;
        this.accountService.selectAccount(accountId);
    }

    private _loadQuickAccessLists() {
        this.applicationData = this.applicationService.list();
        this.poolData.setOptions(this.initialOptions);
        this.applicationData.fetchNext();

        // (error: ServerError) => {
        //     let handled = false;
        //     if (this.applicationService.isAutoStorageError(error)) {
        //         this.noLinkedStorage = true;
        //         handled = true;
        //     }

        //     return !handled;
        // }

        this.jobData = this.jobService.listView();
        this.jobData.setOptions(this.initialOptions);
        this.jobData.fetchNext();

        this.poolData = this.poolService.listView();
        this.poolData.setOptions(this.initialOptions);

        this.poolData.fetchNext();
    }
}
