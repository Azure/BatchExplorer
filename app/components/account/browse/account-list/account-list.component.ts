import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, forwardRef } from "@angular/core";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { Filter, FilterMatcher, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { BatchAccountCommands } from "app/components/account/action";
import { BatchAccount } from "app/models";
import { BatchAccountService, SubscriptionService } from "app/services";
import { flatMap, shareReplay } from "rxjs/operators";

import "./account-list.scss";

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

    public accounts: List<BatchAccount> = List([]);
    public displayedAccounts: List<BatchAccount> = List([]);
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;

    private _accountSub: Subscription;

    constructor(
        public commands: BatchAccountCommands,
        private accountService: BatchAccountService,
        changeDetector: ChangeDetectorRef,
        private subscriptionService: SubscriptionService) {
        super(changeDetector);
        this._updateDisplayedAccounts();

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
        return this.subscriptionService.load().pipe(
            flatMap(() => this.accountService.load()),
            shareReplay(1),
        );
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

    private _updateDisplayedAccounts() {
        const matcher = new FilterMatcher<BatchAccount>();

        this.displayedAccounts = List<BatchAccount>(this.accounts.filter((x) => {
            return matcher.test(this.filter, x);
        }).sortBy(x => x.name));

        this.changeDetector.markForCheck();
    }
}
