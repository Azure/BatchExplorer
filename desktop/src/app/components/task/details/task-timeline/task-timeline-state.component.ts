import { ChangeDetectionStrategy, Component, HostBinding, Input } from "@angular/core";
import { TaskState } from "app/models";
import * as inflection from "inflection";

const stateOrder = [TaskState.active, TaskState.preparing, TaskState.running, TaskState.completed];

@Component({
    selector: "bl-task-timeline-state",
    templateUrl: "task-timeline-state.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTimelineStateComponent {
    @Input()
    public state: TaskState;

    @Input()
    public currentState: TaskState;

    @Input()
    public title: string = "";

    @Input()
    @HostBinding("class.error")
    public error: boolean = false;

    @Input()
    @HostBinding("class.warn")
    public warn: boolean = false;

    @HostBinding("class.active")
    public get active() {
        return this.currentState === this.state && !this.completed;
    }

    @HostBinding("class.done")
    public get done() {
        return this.completed || stateOrder.indexOf(this.currentState) > stateOrder.indexOf(this.state);
    }

    @HostBinding("class.locked")
    public get locked() {
        return stateOrder.indexOf(this.currentState) < stateOrder.indexOf(this.state);
    }

    public get completed() {
        return this.currentState === TaskState.completed;
    }

    public get stateName() {
        return inflection.capitalize(this.state);
    }
}
