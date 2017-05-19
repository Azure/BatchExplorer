import { Component } from "@angular/core";

import { AccountService } from "app/services";

@Component({
    selector: "bl-app-nav",
    templateUrl: "main-navigation.html",
})
export class MainNavigationComponent {

    public selectedId: string;
    public selectedAccountAlias: string = "";

    constructor(accountService: AccountService) {
        accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.selectedId = accountId;
                this.selectedAccountAlias = accountService.getNameFromAccountId(accountId);
            } else {
                this.selectedAccountAlias = "No account selected!";
            }
        });
    }
}
