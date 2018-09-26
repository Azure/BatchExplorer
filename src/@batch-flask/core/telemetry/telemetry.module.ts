import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TelemetryService } from "@batch-flask/core/telemetry/telemetry.service";

@NgModule({
    imports: [BrowserModule],
    providers: [TelemetryService],
})
export class TelemetryModule {
}
