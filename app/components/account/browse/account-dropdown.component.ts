import { AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";
import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";
import { ArmResourceUtils } from "app/utils";

import { ContextMenu, ContextMenuItem, ContextMenuService } from "@batch-flask/ui/context-menu";
import "./account-dropdown.scss";

@Component({
    selector: "bl-account-dropdown",
    templateUrl: "account-dropdown.html",
})
export class AccountDropDownComponent implements AfterViewInit {
    public status = AccountStatus;

    public selectedId: string;
    public selectedAccountAlias: string = "";
    public showDropdown = false;
    public currentAccountValid = AccountStatus.Loading;
    public currentAccountInvalidError: any = null;

    constructor(
        public accountService: AccountService,
        private changeDetection: ChangeDetectorRef,
        private contextMenuService: ContextMenuService) {

        accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.selectedId = accountId;
                this.selectedAccountAlias = ArmResourceUtils.getAccountNameFromResourceId(accountId);
            } else {
                this.selectedId = null;
                this.selectedAccountAlias = "No account selected!";
            }
        });
    }

    public selectAccount(account: AccountResource): void {
        this.accountService.selectAccount(account.id);
    }

    public ngAfterViewInit() {
        this.accountService.currentAccountValid.subscribe((status) => {
            this.currentAccountValid = status;
            this.changeDetection.detectChanges();
        });

        this.accountService.currentAccountInvalidError.subscribe((error) => {
            this.currentAccountInvalidError = error;
            this.changeDetection.detectChanges();
        });
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
