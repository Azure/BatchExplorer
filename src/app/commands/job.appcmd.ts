import { Injector } from "@angular/core";
import { Router } from "@angular/router";
import { CommandRegistry } from "@batch-flask/core";

CommandRegistry.register({
    id: "job.gotoHome",
    description: "Navigate to jobs",
    binding: "ctrl+alt+j",
    execute: (injector: Injector) => {
        injector.get(Router).navigate(["/jobs"]);
    },
});
