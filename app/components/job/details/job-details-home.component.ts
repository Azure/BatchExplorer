import { Component } from "@angular/core";

@Component({
    selector: "bex-job-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-tasks"></i>
            <p>Please select a job from the list</p>
        </div>
    `,
})

export class JobDetailsHomeComponent {
    public static breadcrumb() {
        return { name: "Jobs" };
    }
}
