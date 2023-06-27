import { CommandRegistry } from "@batch-flask/core";

describe("Batch Explorer Command definitions", () => {
    afterEach(() => {
        (CommandRegistry as any)._commands.clear();
    });

    it("define the commands without errors", () => {
        require(".");

        expect(CommandRegistry.getCommands().length).toEqual(6);
    });
});
