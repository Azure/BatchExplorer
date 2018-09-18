import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TelemetryModule } from "@batch-flask/core";
import { ApplicationInsightsUploader } from "./application-insights-uploader";

@NgModule({
    imports: [BrowserModule, TelemetryModule],
    providers: [ApplicationInsightsUploader],
})
export class ApplicationInsightsModule {
}
