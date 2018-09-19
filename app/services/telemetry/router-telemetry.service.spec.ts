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

@Component({
    selector: "bl-layout",
    template: "<router-outlet></router-outlet>",
})
export class LayoutComponent {

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
    let fixture: ComponentFixture<LayoutComponent>;
    beforeEach(() => {
        telemetryServiceSpy = {
            trackEvent: jasmine.createSpy("trackEvent"),
        };
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes(routes)],
            declarations: [HomeComponent, PoolsComponent, LayoutComponent],
            providers: [
                RouterTelemetryService,
                { provide: TelemetryService, useValue: telemetryServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(LayoutComponent);
        fixture.detectChanges();

        router = TestBed.get(Router);
        service = TestBed.get(RouterTelemetryService);
        service.init();

    });

    it("send event when router navigate", async () => {
        expect(telemetryServiceSpy.trackEvent).not.toHaveBeenCalled();
        await TestBed.get(NgZone).run(() => {
            return router.navigateByUrl("/pools");
        });
        fixture.detectChanges();
        expect(telemetryServiceSpy.trackEvent).toHaveBeenCalledOnce();
        expect(telemetryServiceSpy.trackEvent).toHaveBeenCalledWith({
            name: Constants.TelemetryEvents.navigate,
            properties: {
                // componentName: "PoolsComponent",
                componentName: null,
            },
        });
    });
});
