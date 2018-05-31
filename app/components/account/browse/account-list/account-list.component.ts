import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, FilterMatcher, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { BatchAccountCommands } from "app/components/account/action";
import { AccountResource } from "app/models";
import { AccountService, SubscriptionService } from "app/services";

@Component({
    selector: "bl-account-list",
    templateUrl: "account-list.html",
    providers: [
        BatchAccountCommands,
        {
            provide: ListBaseComponent,
            useExisting: forwardRef(() => AccountListComponent),
        },
    ],
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

    private _updateDisplayedAccounts() {
        const matcher = new FilterMatcher<AccountResource>();

        this.displayedAccounts = List<AccountResource>(this.accounts.filter((x) => {
            return matcher.test(this.filter, x);
        }).sortBy(x => x.name));

        this.changeDetector.markForCheck();
    }
}
