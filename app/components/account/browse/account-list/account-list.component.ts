import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, FilterMatcher, autobind } from "@batch-flask/core";
import { ListBaseComponent, ListSelection } from "@batch-flask/core/list";
import { BackgroundTaskService } from "@batch-flask/ui/background-task";
import { ContextMenu, ContextMenuItem } from "@batch-flask/ui/context-menu";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { BatchAccountCommands } from "app/components/account/action";
import { AccountResource } from "app/models";
import { AccountService, SubscriptionService } from "app/services";
import { DeleteAccountDialogComponent, DeleteAccountTask } from "../../action/delete";

@Component({
    selector: "bl-account-list",
    templateUrl: "account-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => AccountListComponent),
    }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountListComponent extends ListBaseComponent implements OnDestroy {

    public accounts: List<AccountResource> = List([]);
    public displayedAccounts: List<AccountResource> = List([]);
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;

    private _accountSub: Subscription;

    constructor(
        public commands: BatchAccountCommands,
        private accountService: AccountService,
        private dialog: MatDialog,
        private taskManager: BackgroundTaskService,
        activatedRoute: ActivatedRoute,
        sidebarManager: SidebarManager,
        changeDetector: ChangeDetectorRef,
        subscriptionService: SubscriptionService) {
        super(changeDetector);
        this._updateDisplayedAccounts();

        this.accountService.accountsLoaded.subscribe(() => {
            this.loadingStatus = LoadingStatus.Ready;
            changeDetector.markForCheck();
        });

        this._accountSub = this.accountService.accounts.subscribe((accounts) => {
            this.accounts = accounts;
            this._updateDisplayedAccounts();
        });
    }

    public ngOnDestroy() {
        this._accountSub.unsubscribe();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.accountService.load();
    }

    public handleFilter(filter: Filter) {
        this._updateDisplayedAccounts();
    }

    public isAccountFavorite(accountId: string) {
        return this.accountService.isAccountFavorite(accountId);
    }

    public toggleFavorite(accountId: string) {
        if (this.isAccountFavorite(accountId)) {
            this.accountService.unFavoriteAccount(accountId);
        } else {
            this.accountService.favoriteAccount(accountId).subscribe({
                complete: () => {
                    this.changeDetector.markForCheck();
                },
            });
        }
    }

    public accountStatus(accountId: string): QuickListItemStatus {
        return this.isAccountFavorite(accountId)
            ? QuickListItemStatus.accent
            : QuickListItemStatus.normal;
    }

    public trackByFn(index, account: AccountResource) {
        return account.id;
    }

    public deleteSelection(selection: ListSelection) {
        this.taskManager.startTask("", (backgroundTask) => {
            const task = new DeleteAccountTask(this.accountService, [...this.selection.keys]);
            task.start(backgroundTask);
            return task.waitingDone;
        });
    }

    public deletePool(account: AccountResource) {
        const dialogRef = this.dialog.open(DeleteAccountDialogComponent);
        dialogRef.componentInstance.accountId = account.id;
        dialogRef.componentInstance.accountName = account.name;
    }

    public contextmenu(account: AccountResource) {
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this.deletePool(account) }),
        ]);
    }

    private _updateDisplayedAccounts() {
        const matcher = new FilterMatcher<AccountResource>();

        this.displayedAccounts = List<AccountResource>(this.accounts.filter((x) => {
            return matcher.test(this.filter, x);
        }).sortBy(x => x.name));

        this.changeDetector.markForCheck();
    }
}
