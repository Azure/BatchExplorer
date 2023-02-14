import { capitalizeFirst } from "../util";
import type { ValuedEntry, ValuedEntryInit } from "./entry";
import type { Form, FormValues } from "./form";
import type { FormImpl } from "./internal/form-impl";
import type { Section } from "./section";
import { ValidationStatus } from "./validation-status";

export enum ParameterType {
    String = "String",
    StringList = "StringList",
    Number = "Number",
    Boolean = "Boolean",
}

export interface ParameterInit<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends ValuedEntryInit<V, K> {
    label?: string;
    hideLabel?: boolean;
    required?: boolean;
    dirty?: boolean;
    onValidateSync?(value: V[K]): ValidationStatus;
    onValidateAsync?(value: V[K]): Promise<ValidationStatus>;
}

export class Parameter<V extends FormValues, K extends Extract<keyof V, string>>
    implements ValuedEntry<V, K>
{
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: K;
    type: string;
    _label?: string;
    description?: string;
    dirty?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    hideLabel?: boolean;
    inactive?: boolean;
    required?: boolean;

    onValidateSync?: (value: V[K]) => ValidationStatus;
    onValidateAsync?: (value: V[K]) => Promise<ValidationStatus>;

    /**
     * A user-visible bit of text which is shown in place of a value when
     * the value is undefined or null.
     */
    placeholder?: string;

    get label(): string {
        return this._label ?? this.name;
    }

    set label(label: string) {
        this._label = label;
    }

    get value(): V[K] {
        return this.parentForm.values[this.name];
    }

    set value(newValue: V[K]) {
        this.parentForm.updateValue(this.name, newValue);
    }

    get validationStatus(): ValidationStatus | undefined {
        return this.parentForm.entryValidationStatus[this.name];
    }

    constructor(
        parentForm: Form<V>,
        name: K,
        type: string,
        init?: ParameterInit<V, K>
    ) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;
        this.type = type;
        this._label = init?.label;
        this.description = init?.description;
        this.dirty = init?.dirty;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.hideLabel = init?.hideLabel;
        this.inactive = init?.inactive;
        this.required = init?.required;

        if (init?.value !== undefined) {
            this.value = init.value;
        }

        if (init?.onValidateSync) {
            this.onValidateSync = init.onValidateSync;
        }
        if (init?.onValidateAsync) {
            this.onValidateAsync = init.onValidateAsync;
        }

        (this.parentForm as FormImpl<V>)._registerEntry(this);
    }

    validateSync(): ValidationStatus {
        let status: ValidationStatus | undefined;

        if (this.required && this.value == null) {
            status = new ValidationStatus(
                "error",
                `${capitalizeFirst(this.label ?? this.name)} is required`
            );
        }

        if (!status && this.onValidateSync) {
            status = this.onValidateSync(this.value);
        }

        if (!status) {
            status = new ValidationStatus("ok");
        }

        return status;
    }

    async validateAsync(): Promise<ValidationStatus> {
        let status: ValidationStatus | undefined;

        if (this.onValidateAsync) {
            status = await this.onValidateAsync(this.value);
        }

        if (!status) {
            status = new ValidationStatus("ok");
        }

        return status;
    }
}
