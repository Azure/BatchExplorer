import { AfterViewInit, ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";

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

    constructor(
        private accountService: AccountService,
        private changeDetection: ChangeDetectorRef,
        router: Router) {

        accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.selectedId = accountId;
                this.selectedAccountAlias = accountService.getNameFromAccountId(accountId);
                // this.router.navigate(["/accounts", this.selectedId]);

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
