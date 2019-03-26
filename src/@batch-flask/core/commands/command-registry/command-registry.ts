import { Injector } from "@angular/core";
import { SanitizedError } from "@batch-flask/utils";
import { CommandContext } from "../context";

export interface Command {
    id: string;
    binding: string;
    when?: (context: CommandContext) => boolean;
    execute: (injector: Injector, context: CommandContext) => Promise<any> | void;
}

export class CommandRegistry {
    public static register(command: Command) {
        if (this._commands.has(command.id)) {
            throw new SanitizedError(`Command with id '${command.id}' was already defined. `
                + `Make sure to have a unique id (Shortcut: ${command.binding}, `
                + `Existing: ${this._commands.get(command.id).binding})`);
        }
        this._commands.set(command.id, command);
    }

    public static getCommand(id: string): Command | null {
        return this._commands.get(id) || null;
    }

    public static getCommands(): Command[] {
        return [...this._commands.values()];
    }

    private static readonly _commands = new Map<string, Command>();
}
