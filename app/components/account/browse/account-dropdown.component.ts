import { AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";

import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";

@Component({
    selector: "bex-account-dropdown",
    templateUrl: "account-dropdown.html",
})
export default class AccountDropDownComponent implements AfterViewInit {
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

    // todo: where do i hold the selected account now that we are binding to the server observable data?
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
