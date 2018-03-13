import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import "./account-monitoring-home.scss";

@Component({
    selector: "bl-account-monitoring-home",
    templateUrl: "account-monitoring-home.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountMonitoringHomeComponent {
    public static breadcrumb(params, queryParams) {
        return {name: "Some name", label: "Some label", icon: "fontawesome-icon"};
    }

    constructor(private changeDetector: ChangeDetectorRef) {

    }
}
