import { translate } from "../localization";
import { FormValues } from "./form";
import { AbstractParameter, ParameterName } from "./parameter";
import { ValidationStatus } from "./validation-status";

/**
 * A parameter containing a password
 */
export class PasswordParameter<
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
            return new ValidationStatus(
                "error",
                translate("bonito.core.form.validation.stringValueError")
            );
        }
        return new ValidationStatus("ok");
    }
}
