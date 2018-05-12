import { Component, Input } from "@angular/core";
import { EntityCommands } from "../entity-commands";

// tslint:disable:trackBy-function
@Component({
    selector: "bl-commands-list",
    template: `
        <ng-container *ngFor="let command of buttonCommands">
            <bl-button
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
    @Input() public commands: EntityCommands<any>;
    @Input() public entity: any;

    public get buttonCommands() {
        return this.commands && this.commands.commands;
    }

    public execute(command) {
        return () => {
            return command.performAction(this.entity);
        };
    }
}
