import { Component } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";

import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";

@Component({
    selector: "bex-account-dropdown",
    templateUrl: "account-dropdown.html",
})
export default class AccountDropDownComponent {
    public status = AccountStatus;

    public selected: AccountResource = null;
    public showAccountDropDown: boolean = true;
    public selectedAccountAlias: string = "";
    public showDropdown = false;

    constructor(private router: Router, private accountService: AccountService) {
        accountService.currentAccount.subscribe((account) => {
            if (account) {
                this.selected = account;
                this.selectedAccountAlias = account.name;
            } else {
                this.selectedAccountAlias = "No account selected!";
            }
        });

        router.events.subscribe((val) => {
            if (val instanceof NavigationStart) {
                // todo: pretty tacky. make better.
                this.showAccountDropDown = !val.url.startsWith("/accounts") && val.url !== "/";
            }
        });
    }

    // todo: where do i hold the selected account now that we are binding to the server observable data?
    public selectAccount(account: AccountResource): void {
        this.accountService.selectAccount(account.id);
    }
}
