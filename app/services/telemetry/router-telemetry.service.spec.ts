import { Component, NgZone } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { TelemetryService } from "@batch-flask/core";
import { Constants } from "common";
import { RouterTelemetryService } from "./router-telemetry.service";

@Component({
    selector: "bl-pools",
    template: "<div></div>",
})
export class PoolsComponent {

}

@Component({
    selector: "bl-home",
    template: "<div></div>",
})
export class HomeComponent {

}
const routes = [
    {
        component: PoolsComponent,
        path: "pools",
    },
    {
        component: HomeComponent,
        path: "",
    },
];

describe("RouterTelemetryService", () => {
    let service: RouterTelemetryService;
    let telemetryServiceSpy;
    let router: Router;
    beforeEach(() => {
        telemetryServiceSpy = {
            trackEvent: jasmine.createSpy("trackEvent"),
        };
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes)],
            declarations: [HomeComponent, PoolsComponent],
            providers: [
                RouterTelemetryService,
                { provide: TelemetryService, useValue: telemetryServiceSpy },
            ],
        });

        router = TestBed.get(Router);
        service = TestBed.get(RouterTelemetryService);
        service.init();

    });

    it("send event when router navigate", async () => {
        expect(telemetryServiceSpy.trackEvent).not.toHaveBeenCalled();
        await TestBed.get(NgZone).run(() => {
            return router.navigateByUrl("/pools");
        });
        expect(telemetryServiceSpy.trackEvent).toHaveBeenCalledOnce();
        expect(telemetryServiceSpy.trackEvent).toHaveBeenCalledWith({
            name: Constants.TelemetryEvents.navigate,
            properties: {
                componentName: "PoolsComponent",
            },
        });
    });
});
