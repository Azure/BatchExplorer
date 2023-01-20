import { Component, NgZone } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { TelemetryService } from "@batch-flask/core";
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
            trackPageView: jasmine.createSpy("trackPageView"),
        };
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes)],
            declarations: [HomeComponent, PoolsComponent],
            providers: [
                RouterTelemetryService,
                { provide: TelemetryService, useValue: telemetryServiceSpy },
            ],
        });

        router = TestBed.inject(Router);
        service = TestBed.inject(RouterTelemetryService);
        service.init();

    });

    it("send event when router navigate", async () => {
        expect(telemetryServiceSpy.trackPageView).not.toHaveBeenCalled();
        await TestBed.inject(NgZone).run(() => {
            return router.navigateByUrl("/pools");
        });
        expect(telemetryServiceSpy.trackPageView).toHaveBeenCalledOnce();
        expect(telemetryServiceSpy.trackPageView).toHaveBeenCalledWith({
            name: "PoolsComponent",
        });
    });
});
