import { AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";

import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";

@Component({
    selector: "bl-account-dropdown",
    templateUrl: "account-dropdown.html",
})
export class AccountDropDownComponent implements AfterViewInit {
    public status = AccountStatus;

    public selected: AccountResource = null;
    public selectedAccountAlias: string = "";
    public showDropdown = false;
    public currentAccountValid = AccountStatus.Loading;

    constructor(
        private accountService: AccountService,
        private changeDetection: ChangeDetectorRef) {

        accountService.currentAccount.subscribe((account) => {
            if (account) {
                this.selected = account;
                this.selectedAccountAlias = account.name;
            } else {
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
    }
}
