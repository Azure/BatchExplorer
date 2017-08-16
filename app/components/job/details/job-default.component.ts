import { Component } from "@angular/core";

@Component({
    selector: "bl-job-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-tasks large"></i>
            <p>Please select a job from the list</p>

            <bl-all-job-graphs-home></bl-all-job-graphs-home>
        </div>
    `,
})

export class JobDefaultComponent {
    public static breadcrumb() {
        return { name: "Jobs" };
    }
}
