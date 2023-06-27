import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EntityView, ListView, ServerError } from "@batch-flask/core";
import { TableConfig } from "@batch-flask/ui";
import { BatchAccount, BatchApplication, Job, Pool } from "app/models";
import {
    ApplicationListParams, BatchAccountService, BatchApplicationService,
    JobListParams, JobService, PoolListParams, PoolService,
} from "app/services";
import { List } from "immutable";
import { Subject, Subscription } from "rxjs";
import { takeUntil } from "rxjs/operators";

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
    public pools: List<Pool>;

    public tableConfig: TableConfig = {
        resizableColumn: false,
        hideHeader: true,
    };

    public account: BatchAccount;
    public accountId: string;
    public loadingError: any;
    public noLinkedStorage: boolean = false;

    public data: EntityView<BatchAccount, any>;

    public applicationData: ListView<BatchApplication, ApplicationListParams>;
    public jobData: ListView<Job, JobListParams>;
    public poolData: ListView<Pool, PoolListParams>;
    private _destroy = new Subject();

    private _paramsSubscriber: Subscription;
    private initialOptions = { maxItems: 10 };

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
        private accountService: BatchAccountService,
        private applicationService: BatchApplicationService,
        private jobService: JobService,
        private poolService: PoolService) {
        this.data = this.accountService.view();
        this.data.item.subscribe((account) => {
            this.account = account;
            this.changeDetector.markForCheck();
            if (account) {
                this._loadQuickAccessLists();
            }
        });

        this.poolData = this.poolService.listView;
        this.poolData.items.pipe(takeUntil(this._destroy)).subscribe((pools) => {
            this.pools = List(pools.slice(0, 10));
            this.changeDetector.markForCheck();
        });
        this.jobData = this.jobService.listView();
        this.applicationData = this.applicationService.listView();
    }

    public ngOnInit() {
        this._paramsSubscriber = this.activatedRoute.params.subscribe(params => {
            this.accountId = params["id"];
            this.selectAccount(this.accountId);
            this.data.params = { id: this.accountId };
            this.data.fetch().subscribe({
                next: () => {
                    this.loadingError = null;
                },
                error: (error) => {
                    this.loadingError = error;
                },
            });
        });
    }

    public ngOnDestroy() {
        this._paramsSubscriber.unsubscribe();
        this.jobData.dispose();
        this.applicationData.dispose();
        this._destroy.unsubscribe();
    }

    public selectAccount(accountId: string): void {
        this.noLinkedStorage = false;
        this.accountService.selectAccount(accountId);
    }

    public trackByFn(item: Pool | Job | BatchApplication) {
        return item.id;
    }

    private _loadQuickAccessLists() {
        this.applicationData.setOptions(this.initialOptions);
        this.applicationData.fetchNext();
        this.applicationData.onError = (error: ServerError) => {
            let handled = false;
            if (this.applicationService.isAutoStorageError(error)) {
                this.noLinkedStorage = true;
                handled = true;
            }

            return !handled;
        };

        this.jobData.setOptions(this.initialOptions);
        this.jobData.fetchNext();
    }
}
