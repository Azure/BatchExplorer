import { Component } from "@angular/core";

@Component({
    selector: "bl-account-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-user"></i>
            <p>Please select an account from the list</p>
        </div>
    `,
})

export class AccountDefaultComponent {
    public static breadcrumb() {
        return { name: "Accounts" };
    }
}
