import { ChangeDetectionStrategy, Component, Injector, Input, OnDestroy, forwardRef } from "@angular/core";
import { Filter, FilterMatcher, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/ui";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { BatchAccountCommands } from "app/components/account/action";
import { BatchAccount } from "app/models";
import { BatchAccountService } from "app/services";
import { List } from "immutable";
import { Observable, Subject, of } from "rxjs";
import { takeUntil } from "rxjs/operators";

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
    @Input() public displayedAccounts: List<BatchAccount> = List([]);
    @Input() public loadingStatus: LoadingStatus = LoadingStatus.Loading;

    private _destroy = new Subject();

    constructor(
        public commands: BatchAccountCommands,
        private accountService: BatchAccountService,
        injector: Injector
    ) {
        super(injector);
        this._updateDisplayedAccounts();

        this.accountService.accounts.pipe(takeUntil(this._destroy)).subscribe((accounts) => {
            this.accounts = accounts;
            this.loadingStatus = LoadingStatus.Ready;
            this._updateDisplayedAccounts();
        });

        this.accountService.accountFavorites.pipe(takeUntil(this._destroy)).subscribe(() => this.changeDetector.markForCheck());
    }

    public ngOnDestroy() {
        super.ngOnDestroy();
        this._destroy.next();
        this._destroy.complete();
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.accountService.loadSubscriptionsAndAccounts()
    }

    public handleFilter(filter: Filter) {
        this._updateDisplayedAccounts();
        return of(this.displayedAccounts.size);
    }

    public isAccountFavorite(accountId: string) {
        return this.accountService.isAccountFavorite(accountId);
    }

    public toggleFavorite(accountId: string) {
        if (this.isAccountFavorite(accountId)) {
            this.accountService.unFavoriteAccount(accountId).subscribe({
                complete: () => {
                    this.changeDetector.markForCheck();
                },
            });
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
