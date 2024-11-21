import { translate } from "@azure/bonito-core";
import {
    AbstractParameter,
    FormValues,
    ParameterName,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
import { equalsIgnoreCase } from "@azure/bonito-core/lib/util";

export const NODE_COMMS_MODE_CLASSIC = "Classic";
export const NODE_COMMS_MODE_DEFAULT = "Default";
export const NODE_COMMS_MODE_SIMPLIFIED = "Simplified";

/**
 * A parameter for the pool node communication mode enum
 */
export class NodeCommsParameter<
    V extends FormValues,
    K extends ParameterName<V>,
> extends AbstractParameter<V, K> {
    validateSync(): ValidationStatus {
        let status = super.validateSync();
        if (status.level === "ok") {
            status = this._validate();
        }
        return status;
    }

    private _validate(): ValidationStatus {
        if (this.value != null) {
            if (typeof this.value !== "string") {
                return new ValidationStatus(
                    "error",
                    translate("bonito.core.form.validation.stringValueError")
                );
            }
            if (
                !(
                    equalsIgnoreCase(this.value, NODE_COMMS_MODE_DEFAULT) ||
                    equalsIgnoreCase(this.value, NODE_COMMS_MODE_SIMPLIFIED) ||
                    equalsIgnoreCase(this.value, NODE_COMMS_MODE_CLASSIC)
                )
            ) {
                return new ValidationStatus(
                    "error",
                    translate("bonito.core.form.validation.invalidEnumValue")
                );
            }
        }
        return new ValidationStatus("ok");
    }
}
