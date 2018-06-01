import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";
import { ArmResourceUtils } from "app/utils";
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
    public currentAccountInvalidError: any = null;
    private _subs: Subscription[] = [];

    constructor(
        public accountService: AccountService,
        private changeDetector: ChangeDetectorRef,
        private contextMenuService: ContextMenuService) {

        this._subs.push(accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.selectedId = accountId;
                this.selectedAccountAlias = ArmResourceUtils.getAccountNameFromResourceId(accountId);
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

        this._subs.push(this.accountService.currentAccountInvalidError.subscribe((error) => {
            this.currentAccountInvalidError = error;
            this.changeDetector.markForCheck();
        }));
    }

    public selectAccount(account: AccountResource): void {
        this.accountService.selectAccount(account.id);
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    public openContextMenu(account: AccountResource) {
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

    public trackByFn(index, account: AccountResource) {
        return account.id;
    }

    private _unFavoriteAccount(account: AccountResource) {
        this.accountService.unFavoriteAccount(account.id);
    }
}
