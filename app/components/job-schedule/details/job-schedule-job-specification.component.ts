import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from "@angular/core";

import { WorkspaceService } from "@batch-flask/ui";
import { SidebarManager } from "@batch-flask/ui/sidebar";
import { JobConfigurationComponent } from "app/components/job/details";
import { JobService } from "app/services";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-job-schedule-job-specification",
    templateUrl: "job-schedule-job-specification.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobScheduleJobSpecificationComponent extends JobConfigurationComponent {
    constructor(
        changeDetector: ChangeDetectorRef,
        jobService: JobService,
        sidebarManager: SidebarManager,
        workspaceService: WorkspaceService) {

        super(changeDetector, jobService, sidebarManager, workspaceService);
    }
}
