import { Injectable } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { filter } from "rxjs/operators";

/**
 * Send telemetry about which components are loaded
 */
@Injectable()
export class RouterTelemetryService {
    constructor(private router: Router) {

    }

    public init() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationStart),
        ).subscribe((event: NavigationStart) => {
            console.log("Nav to", event.id);
        });
    }
}
