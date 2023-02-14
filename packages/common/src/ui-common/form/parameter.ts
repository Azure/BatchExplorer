import { capitalizeFirst } from "../util";
import type { ValuedEntry, ValuedEntryInit } from "./entry";
import type { Form, FormValues } from "./form";
import { FormImpl } from "./internal/form-impl";
import type { Section } from "./section";
import { ValidationStatus } from "./validation-status";

export type ParameterName<V extends FormValues> = Extract<keyof V, string>;

export interface ParameterInit<V extends FormValues, K extends ParameterName<V>>
    extends ValuedEntryInit<V, K> {
    label?: string;
    hideLabel?: boolean;
    required?: boolean;
    dirty?: boolean;
    onValidateSync?(value: V[K]): ValidationStatus;
    onValidateAsync?(value: V[K]): Promise<ValidationStatus>;
}

export interface Parameter<V extends FormValues, K extends ParameterName<V>> {
    /**
     * A reference to the form containing this parameter.
     */
    readonly parentForm: Form<V>;

    /**
     * A reference to the section containing this parameter or undefined
     * if the parameter is not in a section.
     */
    readonly parentSection?: Section<V>;

    /**
     * The name of the parameter (must be unique inside the form)
     */
    name: K;

    /**
     * The value of the parameter
     */
    value: V[K];

    /**
     * A short, friendly label for the parameter. Often displayed either to
     * the side or above the parameter's form control.
     */
    label?: string;

    /**
     * A long-form description of the parameter. Might be displayed as a
     * tooltip or info bubble.
     */
    description?: string;

    /**
     * Mark this parameter as having been modified by user interaction.
     * This can be useful for determining whether validation should be run
     * immediately or deferred until either a user modifies the value or
     * a the form is submitted.
     */
    dirty?: boolean;

    /**
     * Disable interaction
     */
    disabled?: boolean;

    /**
     * Visually hide the parameter, but its value will remain in the
     * form.
     */
    hidden?: boolean;

    /**
     * Hide any associated label control
     */
    hideLabel?: boolean;

    /**
     * If true, this parameter will fail validation if its value is
     * undefined or null
     */
    required?: boolean;

    /**
     * A user-visible bit of text which is shown in place of a value when
     * the value is undefined or null.
     */
    placeholder?: string;

    /**
     * The current validation status of the parameter. If validation has
     * not yet been performed, this will be undefined.
     */
    readonly validationStatus?: ValidationStatus;

    /**
     * A callback to do synchronous validation of this parameter
     *
     * @param value The value to validate
     * @returns A ValidationStatus object with the results of the validation
     */
    onValidateSync?: (value: V[K]) => ValidationStatus;

    /**
     * A callback to do async validation of this parameter
     *
     * @param value The value to validate
     * @returns A promise which resolves to a ValidationStatus object
     */
    onValidateAsync?: (value: V[K]) => Promise<ValidationStatus>;
}

export abstract class AbstractParameter<
    V extends FormValues,
    K extends ParameterName<V>
> implements ValuedEntry<V, K>
{
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: K;
    _label?: string;
    description?: string;
    dirty?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    hideLabel?: boolean;
    required?: boolean;
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

    constructor(parentForm: Form<V>, name: K, init?: ParameterInit<V, K>) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;
        this._label = init?.label;
        this.description = init?.description;
        this.dirty = init?.dirty;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.hideLabel = init?.hideLabel;
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

    onValidateSync?: (value: V[K]) => ValidationStatus;
    onValidateAsync?: (value: V[K]) => Promise<ValidationStatus>;

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
