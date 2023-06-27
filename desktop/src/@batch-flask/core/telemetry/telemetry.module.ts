import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TelemetryService } from "@batch-flask/core/telemetry/telemetry.service";

@NgModule({
    imports: [CommonModule],
    providers: [TelemetryService],
})
export class TelemetryModule {
}
