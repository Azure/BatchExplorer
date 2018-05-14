import { EntityCommand, Permission } from "@batch-flask/ui";

import { Injectable, Injector } from "@angular/core";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";

@Injectable()
export class TerminateJobCommand extends EntityCommand<Job> {
    constructor(injector: Injector) {
        const jobService = injector.get(JobService);

        super(injector, {
            label: "Terminate",
            icon: "fa fa-stop",
            action: (job: Job) => jobService.terminate(job.id),
            enabled: (job) => job.state !== JobState.completed,
            permission: Permission.Write,
            confirm: true,
        });
    }
}
