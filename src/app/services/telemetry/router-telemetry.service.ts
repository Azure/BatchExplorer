import { Injectable } from "@angular/core";
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { TelemetryService } from "@batch-flask/core";
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
            this.telemetryService.trackPageView({
                name: this._getComponent(),
            });
        });
    }

    private _getComponent() {
        let current = this.activatedRoute.snapshot;

        while (current.firstChild) {
            current = current.firstChild;
        }

        return this._getComponentName(current);
    }

    private _getComponentName(route: ActivatedRouteSnapshot): string | null {
        if (route.component) {
            return (route.component as any).name;
        } else {
            return null;
        }
    }
}
