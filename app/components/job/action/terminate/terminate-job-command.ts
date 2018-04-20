import { EntityCommand } from "@batch-flask/ui";

import { Injectable } from "@angular/core";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";

@Injectable()
export class TerminateJobCommand extends EntityCommand<Job> {
    constructor(jobService: JobService) {
        super({
            label: "Terminate",
            action: (job: Job) => jobService.terminate(job.id),
            enabled: (job) => job.state !== JobState.completed,
            confirm: true,
        });
    }
}
