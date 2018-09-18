import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TELEMETRY_UPLOADER, TelemetryModule } from "@batch-flask/core";
import { ApplicationInsightsUploader } from "./application-insights-uploader";

@NgModule({
    imports: [BrowserModule, TelemetryModule],
    providers: [
        {provide: TELEMETRY_UPLOADER, useClass: ApplicationInsightsUploader},
    ],
})
export class ApplicationInsightsModule {
}
