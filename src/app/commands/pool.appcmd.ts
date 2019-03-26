import { Injector } from "@angular/core";
import { Router } from "@angular/router";
import { CommandRegistry } from "@batch-flask/core";

CommandRegistry.register({
    id: "pool.gotoHome",
    binding: "ctrl+alt+p",
    execute: (injector: Injector) => {
        injector.get(Router).navigate(["/pools"]);
    },
});
