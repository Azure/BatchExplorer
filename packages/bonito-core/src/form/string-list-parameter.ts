import { translate } from "../localization";
import { FormValues } from "./form";
import { AbstractParameter, ParameterName } from "./parameter";
import { ValidationStatus } from "./validation-status";

export interface StringListValidationDetails {
    [key: number]: string;
}

/**
 * A parameter with a value that is a list of strings
 */
export class StringListParameter<
    V extends FormValues,
    K extends ParameterName<V>,
> extends AbstractParameter<V, K> {
    validateSync() {
        let status = super.validateSync();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }
    private _validate(): ValidationStatus {
        let hasError = false;
        const vData: StringListValidationDetails = {};
        if (this.value != null && Array.isArray(this.value)) {
            for (const [i, v] of this.value.entries()) {
                if (typeof v !== "string") {
                    hasError = true;
                    // Found a non-string value
                    vData[i] = translate(
                        "bonito.core.form.validation.stringValueError"
                    );
                }
            }
        }
        return hasError
            ? new ValidationStatus(
                  "error",
                  translate("bonito.core.form.validation.stringListValueError"),
                  vData
              )
            : new ValidationStatus("ok");
    }
}
