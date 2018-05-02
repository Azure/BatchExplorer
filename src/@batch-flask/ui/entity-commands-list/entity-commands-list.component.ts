import { Component, Input } from "@angular/core";
import { EntityCommand, EntityCommandType, EntityCommands } from "../entity-commands";

@Component({
    selector: "bl-commands-list",
    template: `
        <ng-container *ngFor="let command of buttonCommands;trackBy: trackByCommands">
            <ng-container [ngSwitch]="command.type">
                <ng-container *ngSwitchCase="EntityCommandType.Refresh">
                    <bl-refresh-btn [refresh]="command.execute(entity)"></bl-refresh-btn>
                </ng-container>
            </ng-container>
        </ng-container>
    `,
})
export class EntityCommandsListComponent {
    public EntityCommandType = EntityCommandType;

    @Input() public commands: EntityCommands<any>;
    @Input() public entity: any;

    public get buttonCommands() {
        return this.commands && this.commands.buttonCommands;
    }

    public trackByCommands(index, command: EntityCommand<any, any>) {
        return command.type;
    }
}
