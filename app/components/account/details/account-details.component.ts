import { Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "core-decorators";
import { Subscription } from "rxjs";

import { AccountResource, Application, ApplicationPackage, Job, Pool } from "app/models";
import { AccountService, ApplicationService, JobService, PoolService } from "app/services";
import { RxListProxy } from "app/services/core";

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

    public applicationData: RxListProxy<{}, Application>;
    public jobData: RxListProxy<{}, Job>;
    public poolData: RxListProxy<{}, Pool>;

    private _paramsSubscriber: Subscription;
    private initialOptions = { maxItems: 10 };

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
        private applicationService: ApplicationService,
        private jobService: JobService,
        private poolService: PoolService,
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

                    console.log("loading data for account", this.accountId);
                    this.applicationData = this.applicationService.list(this.initialOptions);
                    this.applicationData.fetchNext();
                    this.jobData = this.jobService.list(this.initialOptions);
                    let j = this.jobData.fetchNext();
                    j.subscribe({
                        next: (js) => {
                            console.log(js);
                        },
                    });
                    this.poolData = this.poolService.list(this.initialOptions);
                    this.poolData.fetchNext();
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
        return this.accountService.refresh();
    }

    public selectAccount(accountId: string): void {
        this.accountService.selectAccount(accountId);
    }
}
