import { ErrorHandler } from "@angular/core";
import { log } from "app/utils";
import { remote } from "electron";

export class BatchLabsErrorHandler extends ErrorHandler {
    constructor() {
        super();
    }

    public handleError(error) {
        log.error("[BL] Uncaught exception:", this._extractMessage(error));
        super.handleError(error);
        handleCoreError(error);
    }

    private _extractMessage(error: any): string {
        return error instanceof Error ? error.message : error.toString();
    }
}

/**
 * This will make sure the window is being displayed in case of a bad error.
 */
export function handleCoreError(error) {
    const window = remote.getCurrentWindow();
    if (!window.isVisible()) {
        window.show();
    }
}
