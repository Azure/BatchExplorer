import { Deferred } from "../util";
import type { FormValues } from "./form";
import { ParameterName } from "./parameter";
import { ValidationStatus } from "./validation-status";

export class ValidationSnapshot<V extends FormValues> {
    readonly values: V;

    overallStatus: ValidationStatus | undefined;
    onValidateSyncStatus: ValidationStatus | undefined;
    onValidateAsyncStatus: ValidationStatus | undefined;

    entryStatus: {
        [name in ParameterName<V>]?: ValidationStatus;
    } = {};

    syncValidationComplete: boolean = false;
    asyncValidationComplete: boolean = false;

    get allValidationComplete(): boolean {
        return (
            this.overallStatus != null &&
            this.syncValidationComplete &&
            this.asyncValidationComplete
        );
    }

    readonly isInitialSnapshot: boolean;
    readonly validationCompleteDeferred: Deferred<void> = new Deferred();

    constructor(formValues: V, isFirstSnapshot: boolean = false) {
        this.values = formValues;
        this.isInitialSnapshot = isFirstSnapshot;
    }

    ok<K extends ParameterName<V>>(entryName: K, message?: string): void {
        this.entryStatus[entryName] = new ValidationStatus("ok", message ?? "");
    }

    error<K extends ParameterName<V>>(entryName: K, message: string): void {
        this.entryStatus[entryName] = new ValidationStatus("error", message);
    }

    warn<K extends ParameterName<V>>(entryName: K, message: string): void {
        this.entryStatus[entryName] = new ValidationStatus("warn", message);
    }

    updateOverallStatus(): void {
        let warningCount = 0;
        let errorCount = 0;
        let lastWarningMsg: string | undefined;
        let lastErrorMsg: string | undefined;
        for (const entry of Object.values(this.entryStatus)) {
            if (entry) {
                if (entry.level === "warn") {
                    warningCount++;
                    lastWarningMsg = entry.message;
                } else if (entry.level === "error") {
                    errorCount++;
                    lastErrorMsg = entry.message;
                }
            }
        }

        let overallStatus: ValidationStatus;
        if (errorCount > 0) {
            let errorMsg: string;
            if (errorCount === 1 && lastErrorMsg) {
                errorMsg = lastErrorMsg;
            } else {
                errorMsg = `${errorCount} ${
                    errorCount === 1 ? "error" : "errors"
                } found`;
            }
            overallStatus = new ValidationStatus("error", errorMsg);
        } else if (warningCount > 0) {
            let warningMsg: string;
            if (warningCount === 1 && lastWarningMsg) {
                warningMsg = lastWarningMsg;
            } else {
                warningMsg = `${warningCount} ${
                    warningCount === 1 ? "warning" : "warnings"
                } found`;
            }
            overallStatus = new ValidationStatus("warn", warningMsg);
        } else {
            overallStatus = new ValidationStatus("ok");
        }

        if (overallStatus.level === "ok" && this.onValidateSyncStatus) {
            overallStatus = this.onValidateSyncStatus;
        }

        if (overallStatus.level === "ok" && this.onValidateAsyncStatus) {
            overallStatus = this.onValidateAsyncStatus;
        }

        this.overallStatus = overallStatus;
    }
}
