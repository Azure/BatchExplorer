import { FormValues } from "./form";
import { AbstractParameter, ParameterName } from "./parameter";
import { ValidationStatus } from "./validation-status";

/**
 * A parameter with any string value
 */
export class StringParameter<
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
        if (this.value != null && typeof this.value !== "string") {
            return new ValidationStatus("error", "Value must be a string");
        }
        return new ValidationStatus("ok");
    }
}
