import { NgModule } from "@angular/core";
import { TelemetryService } from "@batch-flask/core";

export class TestTelemetryService {
    public trackEvent: jasmine.Spy;
    public trackMetric: jasmine.Spy;
    public trackException: jasmine.Spy;

    constructor() {
        this.trackEvent = jasmine.createSpy("trackEvent");
        this.trackMetric = jasmine.createSpy("trackMetric");
        this.trackException = jasmine.createSpy("trackException");
    }
}

@NgModule({
    providers: [
        { provide: TelemetryService, useClass: TestTelemetryService },
    ],
})
export class TelemetryTestingModule {

}
