import { Injector } from "@angular/core";
import { CommandContext } from "../context";

export interface Command {
    id: string;
    binding: string;
    when: (context: CommandContext) => boolean;
    execute: (injector: Injector, context: CommandContext) => Promise<any> | void;
}

export class CommandRegistry {
    public static register(command: Command) {
        this._commands.set(command.id, command);
    }

    public static getCommand(id: string): Command | null {
        return this._commands.get(id) || null;
    }

    public static getCommands(): Command[] {
        return [...this._commands.values()];
    }

    private static _commands = new Map<string, Command>();
}
