import { Component, Input } from "@angular/core";
import { AccountResource } from "app/models";

import "./account-quotas-card.scss";

@Component({
    selector: "bl-account-quotas-card",
    templateUrl: "account-quotas-card.html",
})
export class AccountQuotasCardComponent {
    @Input()
    public account: AccountResource;
}
