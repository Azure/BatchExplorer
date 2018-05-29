import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BaseButton } from "@batch-flask/ui/buttons";
import { Job, JobState } from "app/models";

@Component({
    selector: "bl-add-task-button",
    template: `
        <bl-button color="light" [action]="action" [disabled]="!enabled" [title]="title"
            icon="fa fa-plus" permission="write">
        </bl-button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTaskButtonComponent extends BaseButton {
    @Input() public job: Job;

    @Input() public title: string = "Add";

    public get enabled() {
        return this.job
            && this.job.state !== JobState.completed
            && this.job.state !== JobState.deleting
            && this.job.state !== JobState.terminating;
    }
}
