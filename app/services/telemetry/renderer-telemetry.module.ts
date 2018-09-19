import { NgModule } from "@angular/core";
import { TELEMETRY_UPLOADER, TelemetryModule } from "@batch-flask/core";
import { RendererTelemetryUploader } from "./renderer-telemetry-uploader";
import { RouterTelemetryService } from "./router-telemetry.service";

@NgModule({
    imports: [TelemetryModule],
    providers: [
        { provide: TELEMETRY_UPLOADER, useClass: RendererTelemetryUploader },
        RouterTelemetryService,
    ],
})
export class RendererTelemetryModule {

    constructor(routerTelemetry: RouterTelemetryService) {
        routerTelemetry.init();
    }
}
