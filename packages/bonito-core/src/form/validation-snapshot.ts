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

        // Prefer parameter validation error, then async validation errors,
        // then sync validation errors in that order
        const computeOverallStatus = (validateStatus?: ValidationStatus) => {
            if (validateStatus) {
                if (
                    overallStatus.level === "error" &&
                    validateStatus.level === "error"
                ) {
                    overallStatus = validateStatus;
                } else if (
                    overallStatus.level === "warn" &&
                    (validateStatus.level === "warn" ||
                        validateStatus.level === "error")
                ) {
                    overallStatus = validateStatus;
                } else if (overallStatus.level === "ok" && validateStatus) {
                    overallStatus = validateStatus;
                }
            }
        };
        computeOverallStatus(this.onValidateAsyncStatus);
        computeOverallStatus(this.onValidateSyncStatus);

        this.overallStatus = overallStatus;
    }
}
