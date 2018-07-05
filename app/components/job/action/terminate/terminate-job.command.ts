import { COMMAND_LABEL_ICON, EntityCommand, Permission } from "@batch-flask/ui";

import { Injectable, Injector } from "@angular/core";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";

@Injectable()
export class TerminateJobCommand extends EntityCommand<Job> {
    constructor(injector: Injector) {
        const jobService = injector.get(JobService);

        super(injector, {
            ...COMMAND_LABEL_ICON.Terminate,
            action: (job: Job) => jobService.terminate(job.id),
            enabled: (job) => job.state !== JobState.completed,
            permission: Permission.Write,
            confirm: true,
            feature: "job.action.terminate",
        });
    }
}
