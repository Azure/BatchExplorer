import { ChangeDetectionStrategy, Component } from "@angular/core";

import "./account-monitoring-home.scss";

@Component({
    selector: "bl-account-monitoring-home",
    templateUrl: "account-monitoring-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMonitoringHomeComponent {
    public static breadcrumb(params, queryParams) {
        return {name: "Monitoring"};
    }
}
