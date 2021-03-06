import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SidebarManager } from "@batch-flask/ui";
import { BatchAccountService } from "app/services";
import { Subscription } from "rxjs";
import { BatchAccountCreateComponent } from "../action/create";

@Component({
    selector: "bl-account-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-user"></i>
            <p>Please select an account from the list</p>

            <bl-button type="wide" class="add-account-btn" (do)="addBatchAccount()">
                Create a new batch account
            </bl-button>
        </div>
    `,
})

export class AccountDefaultComponent implements OnInit, OnDestroy {
    public static breadcrumb() {
        return { name: "Accounts" };
    }

    private accountChangeSubscription: Subscription;

    constructor(
        private accountService: BatchAccountService,
        private sidebarManager: SidebarManager,
        private router: Router) {
    }

    public ngOnInit(): void {
        // Subscribe to the current account id. If it has been set elsewhere (e.g. the top nav)
        // then navigate the component to that account
        this.accountChangeSubscription = this.accountService.currentAccountId.subscribe((accountId) => {
            if (accountId) {
                this.router.navigate(["/accounts", accountId]);
            }
        });
    }

    public ngOnDestroy(): void {
        this.accountChangeSubscription.unsubscribe();
    }

    public addBatchAccount() {
        this.sidebarManager.open("add-batch-account", BatchAccountCreateComponent);
    }
}
