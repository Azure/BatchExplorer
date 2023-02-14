import {
    AbstractParameter,
    FormValues,
    ParameterName,
    ValidationStatus,
} from "@batch/ui-common/lib/form";

/**
 * A parameter with a storage account ARM resource ID as its value.
 */
export class StorageAccountParameter<
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
            return new ValidationStatus("error", "Invalid storage account ID");
        }
        return new ValidationStatus("ok");
    }
}
