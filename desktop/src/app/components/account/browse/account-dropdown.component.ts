import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { BatchAccount } from "app/models";
import { AccountStatus, BatchAccountService } from "app/services";
import { Subscription } from "rxjs";

import "./account-dropdown.scss";

@Component({
    selector: "bl-account-dropdown",
    templateUrl: "account-dropdown.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDropDownComponent implements OnDestroy {
    public status = AccountStatus;

    public selectedId: string;
    public selectedAccountAlias: string = "";
    public showDropdown = false;
    public currentAccountValid = AccountStatus.Loading;
    private _subs: Subscription[] = [];

    constructor(
        public accountService: BatchAccountService,
        private changeDetector: ChangeDetectorRef,
        private contextMenuService: ContextMenuService) {

        this._subs.push(accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.selectedId = accountId;

                this.selectedAccountAlias = this.accountService.getNameFromId(accountId);
            } else {
                this.selectedId = null;
                this.selectedAccountAlias = "No account selected!";
            }
            this.changeDetector.markForCheck();
        }));

        this._subs.push(this.accountService.currentAccountValid.subscribe((status) => {
            this.currentAccountValid = status;
            this.changeDetector.markForCheck();
        }));
    }

    public selectAccount(account: BatchAccount): void {
        this.accountService.selectAccount(account.id);
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public openContextMenu(account: BatchAccount) {
        if (this.selectedId === account.id) {
            return;
        }
        const items = [
            new ContextMenuItem({
                label: "Select",
                click: () => this.selectAccount(account),
            }),
            new ContextMenuItem({
                label: "Remove favorite",
                click: () => this._unFavoriteAccount(account),
            }),
        ];
        this.contextMenuService.openMenu(new ContextMenu(items));
    }

    public trackByFn(_: number, account: BatchAccount) {
        return account.id;
    }

    private _unFavoriteAccount(account: BatchAccount) {
        this.accountService.unFavoriteAccount(account.id).subscribe();
    }
}
