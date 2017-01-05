import { Component } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";

import { AccountResource } from "app/models";
import { AccountService, AccountStatus } from "app/services";

@Component({
    selector: "bex-account-dropdown",
    template: `
        <bex-dropdown class="account-dropdown">
            <div bex-dropdown-btn
                [routerLink]="['/accounts/', (accountService.currentAccount | async)?.name]"
                [class.invalid]="(accountService.currentAccountValid | async) === status.Invalid">
                {{selectedAccountAlias}}

                <i *ngIf="(accountService.currentAccountValid | async) === status.Invalid"
                    class="fa fa-warning"></i>

                <i *ngIf="(accountService.currentAccountValid | async) === status.Loading"
                    class="fa fa-spinner fa-spin"></i>
            </div>
            <div bex-dropdown-content>
                <div *ngFor="let account of accountService.accounts | async" class="dropdown-item"
                        [routerLink]="['/accounts', account.id]"
                        (click)="selectAccount(account)" [class.selected]="account === selected">
                    <div class="main">
                        <div class="alias">{{account.alias}}</div>
                        <div class="url">{{account.url}}</div>
                    </div>
                    <div *ngIf="account === selected" class="extra">
                        <i class="fa fa-check"></i>
                    </div>
                </div>
                <div class="dropdown-item" routerLink="accounts">
                    <i class="fa fa-cog fa-2x"></i>Manage accounts
                </div>
            </div>
        </bex-dropdown>
    `,
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
