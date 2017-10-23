import { ErrorHandler } from "@angular/core";
import { log } from "app/utils";
import { remote } from "electron";

function extractMessage(error: any): string {
    return error instanceof Error ? error.message : error.toString();
}

export class BatchLabsErrorHandler extends ErrorHandler {
    constructor() {
        super();
    }

    public handleError(error) {
        super.handleError(error);
        handleCoreError(error);
    }

}

/**
 * This will make sure the window is being displayed in case of a bad error.
 */
export function handleCoreError(error) {
    log.error("[BL] Uncaught exception:", extractMessage(error));

    const window = remote.getCurrentWindow();
    if (!window.isVisible()) {
        window.show();
    }
}
