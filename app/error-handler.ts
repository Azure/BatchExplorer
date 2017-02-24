import { ErrorHandler } from "@angular/core";
import { remote } from "electron";

export class BatchLabsErrorHandler implements ErrorHandler {
    public handleError(error) {
        console.error("Uncaught exception:", error);
        handleCoreError(error);
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
