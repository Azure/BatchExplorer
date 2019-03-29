import { Injector } from "@angular/core";
import { CommandContext, CommandRegistry } from "@batch-flask/core";
import { AbstractListBase } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";

CommandRegistry.register({
    id: "list.deleteItem",
    description: "Delete item in list",
    binding: "delete",
    when: (context: CommandContext) => {
        return context.has("list.focused");
    },
    execute: (_: Injector, context: CommandContext) => {
        const list = context.get("list.focused");
        if (!(list instanceof AbstractListBase)) {
            log.error("Cannot delete item command context is not of enitty command type");
            return;
        }
        if (list.selection.isEmpty()) { return; }

        const deleteCommand = list.commands.getCommandById("delete");
        if (deleteCommand) {
            deleteCommand.executeFromSelection(list.selection).subscribe();
        }
    },
});

CommandRegistry.register({
    id: "list.selectAll",
    description: "Select all items in list",
    binding: "ctrl+a",
    when: (context: CommandContext) => {
        return context.has("list.focused");
    },
    execute: (_: Injector, context: CommandContext) => {
        const list = context.get("list.focused");
        if (!(list instanceof AbstractListBase)) {
            log.error("Cannot delete item command context is not of enitty command type");
            return;
        }
        list.selectAll();
    },
});
