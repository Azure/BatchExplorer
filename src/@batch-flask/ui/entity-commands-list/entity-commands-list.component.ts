import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { EntityCommand, EntityCommands } from "../entity-commands";

@Component({
    selector: "bl-commands-list",
    templateUrl: "entity-commands-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCommandsListComponent {
    @Input() public commands: EntityCommands<any>;
    @Input() public entity: any;

    public get buttonCommands() {
        return this.commands && this.commands.commands;
    }

    public trackCommand(index, command: EntityCommand<any>) {
        return command.label;
    }
}
