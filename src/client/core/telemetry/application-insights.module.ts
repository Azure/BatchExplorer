import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TELEMETRY_UPLOADER, TelemetryModule } from "@batch-flask/core";
import { ApplicationInsightsUploader } from "./application-insights-uploader";
import { TelemetryManager } from "./telemetry-manager";

@NgModule({
    imports: [BrowserModule, TelemetryModule],
    providers: [
        TelemetryManager,
        {provide: TELEMETRY_UPLOADER, useClass: ApplicationInsightsUploader},
    ],
})
export class ApplicationInsightsModule {
}
