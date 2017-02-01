import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { TaskState } from "app/models";
import * as inflection from "inflection";

const stateOrder = [TaskState.active, TaskState.preparing, TaskState.running, TaskState.completed];

@Component({
    selector: "bex-task-lifetime-state",
    templateUrl: "task-lifetime-state.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskLifetimeStateComponent {
    @Input()
    public state: TaskState;

    @Input()
    public currentState: TaskState;

    public get active() {
        return this.currentState === this.state && !this.completed;
    }

    public get done() {
        return this.completed || stateOrder.indexOf(this.currentState) > stateOrder.indexOf(this.state);
    }

    public get completed() {
        return this.currentState === TaskState.completed;
    }

    public get stateName() {
        return inflection.capitalize(this.state);
    }
}
