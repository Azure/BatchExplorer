import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";

import { ServerError, autobind } from "@batch-flask/core";
import { AccountProvisingState, AccountResource, BatchApplication, Job, Pool } from "app/models";
import {
    AccountParams, AccountService, ApplicationListParams, ApplicationService,
    InsightsMetricsService, JobListParams, JobService, PoolListParams, PoolService,
} from "app/services";
import { EntityView, ListView } from "app/services/core";

import { TableConfig } from "@batch-flask/ui";
import { DialogService } from "@batch-flask/ui/dialogs";
import { ProgramaticUsageComponent } from "app/components/account/details/programatic-usage";
import { DeleteAccountDialogComponent } from "../action/delete";

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

    public tableConfig: TableConfig = {
        resizableColumn: false,
    };

    public accountProvisioningState = AccountProvisingState;
    public account: AccountResource;
    public accountId: string;
    public loadingError: any;
    public noLinkedStorage: boolean = false;

    public data: EntityView<AccountResource, AccountParams>;

    public applicationData: ListView<BatchApplication, ApplicationListParams>;
    public jobData: ListView<Job, JobListParams>;
    public poolData: ListView<Pool, PoolListParams>;

    private _paramsSubscriber: Subscription;
    private initialOptions = { maxItems: 10 };

    constructor(
        router: Router,
        private dialog: MatDialog,
        private changeDetector: ChangeDetectorRef,
        private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
        private dialogService: DialogService,
        private applicationService: ApplicationService,
        private jobService: JobService,
        private poolService: PoolService,
        monitor: InsightsMetricsService,
        zone: NgZone,
        viewContainerRef: ViewContainerRef) {
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
        return this.data.refresh();
    }

    @autobind()
    public showKeys() {
        const ref = this.dialogService.open(ProgramaticUsageComponent);
        ref.componentInstance.accountId = this.accountId;
    }

    @autobind()
    public deleteBatchAccount() {
        const config = new MatDialogConfig();
        const dialogRef = this.dialog.open(DeleteAccountDialogComponent, config);
        dialogRef.componentInstance.accountId = this.accountId;
        dialogRef.componentInstance.accountName = this.account && this.account.name;
    }

    public get accountState() {
        return this.account && this.account.properties && this.account.properties.provisioningState;
    }
    public selectAccount(accountId: string): void {
        this.noLinkedStorage = false;
        this.accountService.selectAccount(accountId);
    }

    public trackByFn(index, item: Pool | Job | BatchApplication) {
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
