import { Injector } from "@angular/core";
import { Router } from "@angular/router";
import { CommandRegistry } from "@batch-flask/core";

CommandRegistry.register({
    id: "data.gotoHome",
    description: "Navigate to data",
    binding: "ctrl+alt+d",
    execute: (injector: Injector) => {
        injector.get(Router).navigate(["/data"]);
    },
});
