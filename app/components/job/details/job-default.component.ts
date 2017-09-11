import { Component } from "@angular/core";

import "./jobs-dashboard.scss";

@Component({
    selector: "bl-jobs-dashboard",
    template: `
        <bl-all-job-graphs-home></bl-all-job-graphs-home>
    `,
})

export class JobDefaultComponent {
    public static breadcrumb() {
        return { name: "Jobs" };
    }
}
