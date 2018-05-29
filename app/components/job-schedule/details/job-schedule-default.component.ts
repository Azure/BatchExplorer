import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
    selector: "bl-job-schedule-details-home",
    template: `
        <div class="no-entity-home">
            <i class="fa fa-calendar large"></i>
            <p>Please select a job schedule from the list</p>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})

export class JobScheduleDefaultComponent {
    public static breadcrumb() {
        return { name: "JobSchedules" };
    }
}
