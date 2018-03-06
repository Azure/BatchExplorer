import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BaseButton } from "@batch-flask/ui/buttons";
import { Job, JobSchedule, JobState, Task } from "app/models";

@Component({
    selector: "bl-terminate-button",
    template: `
        <bl-button color="light" [action]="action" [disabled]="!enabled" icon="fa fa-stop"
            title="Terminate" permission="write">
        </bl-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminateButtonComponent extends BaseButton {
    @Input()
    public entity: Job | Task | JobSchedule;

    public get enabled() {
        return this.entity
            && this.entity.state !== JobState.completed
            && this.entity.state !== JobState.terminating
            && this.entity.state !== JobState.deleting;
    }
}
