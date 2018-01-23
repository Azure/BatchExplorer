import { ChangeDetectionStrategy, Component } from "@angular/core";

import { JobConfigurationComponent } from "app/components/job/details";

@Component({
    selector: "bl-job-schedule-job-spec",
    templateUrl: "job-schedule-job-spec.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleJobSpecComponent extends JobConfigurationComponent {
}
