import { Component } from "@angular/core";

@Component({
    selector: "bl-job-schedule-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-database large"></i>
            <p>Please select a job schedule from the list</p>
        </div>
    `,
})

export class JobScheduleDefaultComponent {
    public static breadcrumb() {
        return { name: "JobSchedules" };
    }
}
