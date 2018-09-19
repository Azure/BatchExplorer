import { Injectable } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { TelemetryService } from "@batch-flask/core";
import { Constants } from "common";
import { filter } from "rxjs/operators";

/**
 * Send telemetry about which components are loaded
 */
@Injectable()
export class RouterTelemetryService {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private telemetryService: TelemetryService) {

    }

    public init() {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
        ).subscribe(() => {
            const component: any = this.activatedRoute.root.component;

            this.telemetryService.trackEvent({
                name: Constants.TelemetryEvents.navigate,
                properties: {
                    componentName: component && component.name,
                },
            });
        });
    }
}
