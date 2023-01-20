# Add key bindings in the application

## Core keyboard bindings

Events that are core to the component function. Arrow navigation for a table or list for example should not be implemented this way. Those bindings are probably required by accessibility and the component should listen for keyboard event and deal with it internaly

## Key bindings that can be defined as a command

For all key bindings that are not core to the component functionality you can use the following.

Keybindings works as follow:

- A command is defined
    - Command has a default keyboard binding
    - Command can have rules on when it can get executed
        - If that's the case the component should update the context accordingly
    - Command has a handler that will be executed whtn the shortcut is pressed and the condition are matched

### Defining a new command/key binding

In `src/app/commands` update or create a new file `[name].appcmd.ts` and update the `index.ts` with `import [name].appcmd.ts`.

Define your command with its default key binding there:

- `id` unique identifier for the command that can be used for user keybindings overrides(when supported)
- `binding` Default key binding
- `when` Condition on when the command can be executed. The command context will be passed. You can use the `ContextService` to update the context from the coresponding component
- `execute` Action to perform when the key binding is peformed and the condition are matched. THe injector and context are passed so you can retrieve other service instance and get information from the context.

```ts
import { Injector } from "@angular/core";
import { CommandContext, CommandRegistry } from "@batch-flask/core";
import { AbstractListBase } from "@batch-flask/ui";

CommandRegistry.register({
    id: "list.selectAll",
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
```

## Update the context

If your command is context dependent you can in your component or service update the context

```ts
class MyComponent {

    constructor(private contextService: ContextService) {

    }

    @HostListener("focus")
    public onFocus() {
        this.contextService.setContext("my.focused", true);
    }
    @HostListener("blur")
    public onBlur() {
        this.contextService.removeContext("my.focused");
    }
}
```
