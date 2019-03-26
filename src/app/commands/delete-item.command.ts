import { Injector } from "@angular/core";
import { CommandContext, CommandRegistry } from "@batch-flask/core";
import { EntityCommands } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";

console.log("regiister som eom");
CommandRegistry.register({
    id: "list.deleteItem",
    binding: "delete",
    when: (context: CommandContext) => {
        return context.has("list.isFocused");
    },
    execute: (_: Injector, context: CommandContext) => {
        const commands = context.get("list.commands");
        if (!commands) {
            log.info("Cannot delete item no commands provided");
            return;
        }
        if (!(commands instanceof EntityCommands)) {
            log.error("Cannot delete item command context is not of enitty command type");
            return;
        }

        console.log("command", (commands as any).delete);
    },
});
