import { CommandRegistry } from "./command-registry";

const cmd1 = {
    id: "foo",
    binding: "ctrl+f",
    execute: () => null,
};

describe("CommandRegistry", () => {
    beforeEach(() => {
        CommandRegistry.register(cmd1);
    });

    afterEach(() => {
        (CommandRegistry as any)._commands.clear();
    });

    it("registered the first command", () => {
        expect(CommandRegistry.getCommands()).toEqual([cmd1]);
        expect(CommandRegistry.getCommand("foo")).toEqual(cmd1);
    });

    it("registered another command", () => {
        const cmd2 = {
            id: "bar",
            binding: "ctrl+b",
            when: (context) => context.has("isFocused"),
            execute: () => null,
        };
        CommandRegistry.register(cmd2);

        expect(CommandRegistry.getCommands()).toEqual([cmd1, cmd2]);
        expect(CommandRegistry.getCommand("foo")).toEqual(cmd1);
        expect(CommandRegistry.getCommand("bar")).toEqual(cmd2);
    });

    it("raise error when registering another command with the same id", () => {

        const cmd2 = {
            id: "foo",
            binding: "ctrl+b",
            when: (context) => context.has("isFocused"),
            execute: () => null,
        };
        expect(() => {
            CommandRegistry.register(cmd2);
        }).toThrowError("Command with id 'foo' was already defined. "
            + "Make sure to have a unique id (Shortcut: ctrl+b, Existing: ctrl+f)");

    });

});
