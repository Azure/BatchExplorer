import { Injectable, Injector } from "@angular/core";
import { I18nService } from "@batch-flask/core";
import { EntityCommand, Permission } from "@batch-flask/ui";
import { Job, JobState } from "app/models";
import { JobService } from "app/services";

@Injectable()
export class TerminateJobCommand extends EntityCommand<Job> {
    constructor(injector: Injector) {
        const jobService = injector.get(JobService);
        const i18n = injector.get(I18nService);
        super(injector, {
            name: "terminate",
            label: i18n.t("task-commands.terminate"),
            icon: "fa fa-stop",
            action: (job: Job) => jobService.terminate(job.id),
            enabled: (job) => job.state !== JobState.completed,
            permission: Permission.Write,
            confirm: true,
        });
    }
}
