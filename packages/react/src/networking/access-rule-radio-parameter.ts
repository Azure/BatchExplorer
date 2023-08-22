import {
    AbstractParameter,
    FormValues,
    ParameterName,
    ValidationStatus,
} from "@azure/bonito-core/lib/form";
/**
 * A parameter with a value that is a list of strings
 */

export enum AccessRuleType {
    AllNetworks = "all-networks",
    SelectedNetworks = "selected-networks",
    Disabled = "disabled",
}

export class AccessRuleRadioButtonsParamter<
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
        return new ValidationStatus("ok");
    }
}
