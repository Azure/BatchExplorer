import { ErrorHandler } from "@angular/core";
import { DebugContext } from "@angular/core/src/linker/debug_context";
import { log } from "app/utils";
import { remote } from "electron";

export const ERROR_TYPE = "ngType";
export const ERROR_COMPONENT_TYPE = "ngComponentType";
export const ERROR_DEBUG_CONTEXT = "ngDebugContext";
export const ERROR_ORIGINAL_ERROR = "ngOriginalError";

export function getType(error: Error): Function {
    return (error as any)[ERROR_TYPE];
}

export function getDebugContext(error: Error): DebugContext {
    return (error as any)[ERROR_DEBUG_CONTEXT];
}

export function getOriginalError(error: Error): Error {
    return (error as any)[ERROR_ORIGINAL_ERROR];
}

export class BatchLabsErrorHandler implements ErrorHandler {
    public handleError(error) {
        log.error("[BL] Uncaught exception:", this._extractMessage(error));
        handleCoreError(error);

        if (error instanceof Error) {
            const originalError = this._findOriginalError(error);
            const originalStack = this._findOriginalStack(error);
            const context = this._findContext(error);

            if (originalError) {
                log.error(`ORIGINAL EXCEPTION: ${this._extractMessage(originalError)}`);
            }

            if (originalStack) {
                log.error("ORIGINAL STACKTRACE:");
                log.error(originalStack);
            }

            if (context) {
                log.error("ERROR CONTEXT:");
                log.error(context);
            }
        }

        // We rethrow exceptions, so operations like 'bootstrap' will result in an error
        // when an error happens. If we do not rethrow, bootstrap will always succeed.
        throw error;
    }

    private _extractMessage(error: any): string {
        return error instanceof Error ? error.message : error.toString();
    }

    private _findContext(error: any): any {
        if (error) {
            return getDebugContext(error) ? getDebugContext(error) :
                this._findContext(getOriginalError(error));
        }

        return null;
    }

    private _findOriginalError(error: Error): any {
        let e = getOriginalError(error);
        while (e && getOriginalError(e)) {
            e = getOriginalError(e);
        }

        return e;
    }

    private _findOriginalStack(error: Error): string {
        let e: any = error;
        let stack: string = e.stack;
        while (e instanceof Error && getOriginalError(e)) {
            e = getOriginalError(e);
            if (e instanceof Error && e.stack) {
                stack = e.stack;
            }
        }

        return stack;
    }
}

/**
 * This will make sure the window is being displayed in case of a bad error.
 */
export function handleCoreError(error) {
    const window = remote.getCurrentWindow();
    if (!window.isVisible()) {
        console.log("Show because of error");
        window.show();
    }
}
