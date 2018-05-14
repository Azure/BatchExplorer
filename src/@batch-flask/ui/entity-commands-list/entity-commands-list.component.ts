import { Component, Input } from "@angular/core";
import {
    Application, BlobContainer, Certificate, Job,
    JobSchedule, Node, Pool, Task,
} from "app/models";
import { EntityCommands } from "../entity-commands";

export type CommandType = Pool | Job | JobSchedule | Certificate | BlobContainer | Application | Node | Task;
// tslint:disable:trackBy-function
@Component({
    selector: "bl-commands-list",
    template: `
        <ng-container *ngFor="let command of buttonCommands">
            <bl-button *ngIf="command.isVisible(entity)"
                [action]="execute(command)"
                [title]="command.label(entity)"
                [disabled]="command.disabled(entity)"
                [permission]="command.permission"
                [tooltipPosition]="command.tooltipPosition"
                color="light">
                <i [class]="command.icon(entity)"></i>
            </bl-button>
        </ng-container>
    `,
})
export class EntityCommandsListComponent {
    @Input() public commands: EntityCommands<CommandType>;
    @Input() public entity: CommandType;

    public get buttonCommands() {
        return this.commands && this.commands.commands;
    }

    public execute(command) {
        return () => {
            return command.execute(this.entity);
        };
    }
}
