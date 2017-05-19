import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AccountService } from "app/services";

@Component({
    selector: "bl-account-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-user"></i>
            <p>Please select an account from the list</p>
        </div>
    `,
})

export class AccountDefaultComponent implements OnInit {
    public static breadcrumb() {
        return { name: "Accounts" };
    }

    constructor(
        private accountService: AccountService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.router.navigate(["/accounts", accountId]);
            }
        });
    }
}
