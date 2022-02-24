import { Injector } from "@angular/core";
import { Router } from "@angular/router";
import { CommandRegistry } from "@batch-flask/core";

CommandRegistry.register({
    id: "account.gotoHome",
    description: "Navigate to account dashboard",
    binding: "ctrl+alt+h",
    execute: (injector: Injector) => {
        injector.get(Router).navigate(["/accounts"]);
    },
});
