import { NgModule } from "@angular/core";
import { TELEMETRY_UPLOADER, TelemetryModule } from "@batch-flask/core";
import { RendererTelemetryUploader } from "./renderer-telemetry-uploader";

@NgModule({
    imports: [TelemetryModule],
    providers: [
        { provide: TELEMETRY_UPLOADER, useClass: RendererTelemetryUploader },
    ],
})
export class RendererTelemetryModule {
}
