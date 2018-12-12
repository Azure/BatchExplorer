import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EntityView, ListView, ServerError, autobind } from "@batch-flask/core";
import { ArmBatchAccount, BatchAccount, BatchApplication, Job, Pool } from "app/models";
import {
    ApplicationListParams, ApplicationService, BatchAccountService,
    JobListParams, JobService, PoolListParams, PoolService,
} from "app/services";
import { Subscription } from "rxjs";
import { BatchAccountCommands } from "../action";

import { ElectronShell, TableConfig } from "@batch-flask/ui";

import { Constants } from "common";
import "./account-details.scss";

@Component({
    selector: "bl-account-details",
    templateUrl: "account-details.html",
    providers: [BatchAccountCommands],
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

    private _paramsSubscriber: Subscription;
    private initialOptions = { maxItems: 10 };

    constructor(
        public commands: BatchAccountCommands,
        private changeDetector: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
        private accountService: BatchAccountService,
        private applicationService: ApplicationService,
        private jobService: JobService,
        private shell: ElectronShell,
        private poolService: PoolService) {
        this.data = this.accountService.view();
        this.data.item.subscribe((account) => {
            this.account = account;
            this.changeDetector.markForCheck();
            if (account) {
                this._loadQuickAccessLists();
            }
        });

        this.poolData = this.poolService.listView();
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
        this.poolData.dispose();
        this.jobData.dispose();
        this.applicationData.dispose();
    }

    @autobind()
    public refresh() {
        return this.commands.get(this.accountId);
    }

    public selectAccount(accountId: string): void {
        this.noLinkedStorage = false;
        this.accountService.selectAccount(accountId);
    }

    public get subscriptionId(): string | undefined {
        if (this.account instanceof ArmBatchAccount) {
            const sub = this.account.subscription;
            return sub && sub.subscriptionId;
        } else {
            return undefined;
        }
    }

    public get resourceGroup(): string | undefined {
        if (this.account instanceof ArmBatchAccount) {
            return this.account.resourceGroup;
        } else {
            return undefined;
        }
    }

    public openSubscriptionInPortal() {
        const subscriptionId = this.subscriptionId;
        if (subscriptionId) {
            this.shell.openExternal(Constants.ExternalLinks.subscriptionUrl.format(subscriptionId));
        }
    }

    public openResourceGroupInPortal() {
        const subscriptionId = this.subscriptionId;
        const resourceGroup = this.resourceGroup;
        if (subscriptionId && resourceGroup) {
            this.shell.openExternal(Constants.ExternalLinks.resourceGroupUrl.format(subscriptionId, resourceGroup));
        }
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

        this.poolData.setOptions(this.initialOptions);
        this.poolData.fetchNext();
    }
}
