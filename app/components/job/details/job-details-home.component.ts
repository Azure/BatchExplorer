import { Component } from "@angular/core";

@Component({
    selector: "bex-job-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database"></i>
            <p>Please select a job from the list</p>
        </div>
    `,
})

export class JobDetailsHomeComponent {
    public static breadcrumb({id}) {
        return { name: id, label: "Job" };
    }
}
