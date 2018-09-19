import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TELEMETRY_UPLOADER, TelemetryModule } from "@batch-flask/core";
import { MachineIdService } from "client/core/telemetry/machine-id.service";
import { ApplicationInsightsUploader } from "client/core/telemetry/application-insights-uploader";
import { TelemetryManager } from "client/core/telemetry/telemetry-manager";

@NgModule({
    imports: [BrowserModule, TelemetryModule],
    providers: [
        TelemetryManager,
        MachineIdService,
        {provide: TELEMETRY_UPLOADER, useClass: ApplicationInsightsUploader},
    ],
})
export class ClientTelemetryModule {
}
