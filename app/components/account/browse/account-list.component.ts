import { ChangeDetectorRef, Component, forwardRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { List } from "immutable";
import { Observable } from "rxjs";

import { Filter, FilterMatcher, Operator, autobind } from "@batch-flask/core";
import { ListBaseComponent } from "@batch-flask/core/list";
import { LoadingStatus } from "@batch-flask/ui/loading";
import { QuickListItemStatus } from "@batch-flask/ui/quick-list";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { AccountResource } from "app/models";
import { AccountService, SubscriptionService } from "app/services";

@Component({
    selector: "bl-account-list",
    templateUrl: "account-list.html",
    providers: [{
        provide: ListBaseComponent,
        useExisting: forwardRef(() => AccountListComponent),
    }],
})
export class AccountListComponent extends ListBaseComponent {

    public displayedAccounts: Observable<List<AccountResource>>;
    public loadingStatus: LoadingStatus = LoadingStatus.Loading;

    constructor(
        private accountService: AccountService,
        activatedRoute: ActivatedRoute,
        sidebarManager: SidebarManager,
        changeDetector: ChangeDetectorRef,
        subscriptionService: SubscriptionService) {
        super(changeDetector);
        this._updateDisplayedAccounts();

        this.accountService.accountsLoaded.subscribe(() => {
            this.loadingStatus = LoadingStatus.Ready;
        });
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
            this.accountService.favoriteAccount(accountId);
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
        this.displayedAccounts = this.accountService.accounts.map((accounts) => {
            const matcher = new FilterMatcher<AccountResource>({
                id: (item: AccountResource, value: any, operator: Operator) => {
                    return value === "" || item.name.toLowerCase().startsWith(value.toLowerCase());
                },
                subscriptionId: (item: AccountResource, value: any, operator: Operator) => {
                    return value === "" || item.subscription.subscriptionId === value;
                },
            });

            return List<AccountResource>(accounts.filter((x) => {
                return matcher.test(this.filter, x);
            }).sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                }
                return 0;
            }));
        });
    }
}
