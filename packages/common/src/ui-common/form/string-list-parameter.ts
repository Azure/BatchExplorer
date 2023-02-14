import { FormValues } from "./form";
import { AbstractParameter, ParameterName } from "./parameter";
import { ValidationStatus } from "./validation-status";

/**
 * A parameter with a value that is a list of strings
 */
export class StringListParameter<
    V extends FormValues,
    K extends ParameterName<V>
> extends AbstractParameter<V, K> {
    validateSync(): ValidationStatus {
        let status = super.validateSync();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }

    private _validate(): ValidationStatus {
        if (this.value != null && Array.isArray(this.value)) {
            for (const v of this.value) {
                if (typeof v !== "string") {
                    // Found a non-string value - early out
                    return new ValidationStatus(
                        "error",
                        "All values must be strings"
                    );
                }
            }
        }
        return new ValidationStatus("ok");
    }
}
