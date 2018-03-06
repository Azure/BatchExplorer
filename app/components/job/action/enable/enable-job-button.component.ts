import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BaseButton } from "@batch-flask/ui/buttons";

import { Job, JobState } from "app/models";

@Component({
    selector: "bl-enable-button",
    template: `
        <bl-button color="light" *ngIf="visible" [action]="action" [disabled]="!enabled" title="Enable"
            icon="fa fa-play" permission="write">
        </bl-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnableJobButtonComponent extends BaseButton {
    @Input() public job: Job;

    public get enabled() {
        return this.job && this.job.state === JobState.disabled;
    }

    public get visible() {
        return this.enabled;
    }
}
