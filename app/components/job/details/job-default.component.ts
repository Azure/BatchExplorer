import { Component } from "@angular/core";

@Component({
    selector: "bl-job-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-tasks"></i>
            <p>Please select a job from the list</p>
        </div>
    `,
})

export class JobDefaultComponent {
    public static breadcrumb() {
        return { name: "Jobs" };
    }
}
