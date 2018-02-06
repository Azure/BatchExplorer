import { ChangeDetectionStrategy, Component } from "@angular/core";

import { JobConfigurationComponent } from "app/components/job/details";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-job-schedule-job-specification",
    templateUrl: "job-schedule-job-specification.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleJobSpecificationComponent extends JobConfigurationComponent {
}
