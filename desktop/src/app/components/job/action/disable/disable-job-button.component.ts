import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BaseButton } from "@batch-flask/ui/buttons";
import { Job, JobState } from "../../../../models/azure-batch/job/job";

@Component({
    selector: "bl-disable-button",
    template: `
        <bl-button color="light" [action]="action" *ngIf="visible" icon="fa fa-pause"
            [disabled]="!enabled" title="Disable" permission="write">
        </bl-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisableJobButtonComponent extends BaseButton {
    @Input() public job: Job;

    public get enabled() {
        return this.job
            && this.job.state === JobState.active;
    }

    public get visible() {
        return this.job
            && this.job.state !== JobState.disabling
            && this.job.state !== JobState.disabled;
    }
}
