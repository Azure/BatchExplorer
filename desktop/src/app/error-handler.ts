import { ErrorHandler, Injectable } from "@angular/core";
import { TelemetryService } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { remote } from "electron";

function extractMessage(error: any): string {
    return error instanceof Error ? error.message : error.toString();
}

@Injectable()
export class BatchExplorerErrorHandler extends ErrorHandler {
    constructor(private telemetryService: TelemetryService) {
        super();
    }

    public handleError(error) {
        super.handleError(error);
        handleCoreError(error, this.telemetryService);
    }

}

/**
 * This will make sure the window is being displayed in case of a bad error.
 */
export function handleCoreError(error, telemetryService?: TelemetryService) {
    log.error("[BL] Uncaught exception:", extractMessage(error));

    if (telemetryService) {
        telemetryService.trackError(error);
    }

    const window = remote.getCurrentWindow();
    if (!window.isVisible()) {
        window.show();
    }
}
