import { getLogger, Logger } from "../logging";
import { capitalizeFirst } from "../util";
import type {
    DynamicEntryProperties,
    ValuedEntry,
    ValuedEntryInit,
} from "./entry";
import type { Form, FormValues } from "./form";
import { FormImpl } from "./internal/form-impl";
import type { Section } from "./section";
import { ValidationStatus } from "./validation-status";

export type NoDependencies = Record<never, never>;

export type ParameterDependencies<
    V extends FormValues,
    D extends string = string
> = Record<D, ParameterName<V>>;

export type ParameterName<V extends FormValues> = Extract<keyof V, string>;

export type ParameterDependencyName<
    V extends FormValues,
    D extends ParameterDependencies<V>
> = keyof D & string;

export type ParameterConstructor<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = NoDependencies,
    VD = unknown
> = new (
    form: Form<V>,
    name: K,
    init?: ParameterInit<V, K, D, VD>
) => Parameter<V, K, D, VD>;

export interface ParameterInit<
    V extends FormValues,
    K extends ParameterName<V> = ParameterName<V>,
    D extends ParameterDependencies<V> = NoDependencies,
    VD = unknown
> extends ValuedEntryInit<V, K> {
    label?: string;
    hideLabel?: boolean;
    required?: boolean;
    placeholder?: string;
    dependencies?: D;
    dynamic?: DynamicParameterProperties<V, K>;
    onValidateSync?(value: V[K]): ValidationStatus<VD>;
    onValidateAsync?(value: V[K]): Promise<ValidationStatus<VD>>;
}

export interface DynamicParameterProperties<
    V extends FormValues,
    K extends ParameterName<V>
> extends DynamicEntryProperties<V> {
    value?: (values: V) => V[K];
    label?: (values: V) => string;
    hideLabel?: (values: V) => boolean;
    required?: (values: V) => boolean;
    placeholder?: (values: V) => string;
}

export interface Parameter<
    V extends FormValues,
    K extends ParameterName<V> = ParameterName<V>,
    D extends ParameterDependencies<V> = NoDependencies,
    VD = unknown
> extends ValuedEntry<V, K> {
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
     * An optional map of named dependencies which are required for this
     * parameter where the key is an arbitrary dependency name and the value is
     * the name of another parameter in the form.
     *
     * For example, consider a form for entering a billing address
     * which includes the parameters: `CountryParameter` and
     * `PostalCodeParameter`. A form control which uses `PostalCodeParameter`
     * may want to validate that its value is valid for the given country.
     *
     * This could be done by adding validation logic to the billing address
     * form, but then this could not be re-used for another form that uses
     * `PostalCodeParameter` (maybe a shipping address form). To solve this,
     * `PostalCodeParameter` can declare that it depends on another parameter
     * to provide the currently-selected country.
     *
     * By defining its `dependencies` type as `{ country: K }` where K is a
     * parameter name in the form, this will require any usage of
     * `PostalCodeParameter` to provide the name of a parameter that exists in
     * the same form which contains the country to validate against. The form
     * control can then read this `dependencies` property to obtain the current
     * country without itself knowing the name of the relevant parameter.
     */
    readonly dependencies?: D;

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
     * Disable interaction
     */
    disabled: boolean;

    /**
     * Visually hide the parameter, but its value will remain in the
     * form.
     */
    hidden: boolean;

    /**
     * Hide any associated label control
     */
    hideLabel: boolean;

    /**
     * If true, this parameter will fail validation if its value is
     * undefined or null
     */
    required: boolean;

    /**
     * A user-visible bit of text which is shown in place of a value when
     * the value is undefined or null.
     */
    placeholder?: string;

    dynamic?: DynamicParameterProperties<V, K>;

    /**
     * The current validation status of the parameter. If validation has
     * not yet been performed, this will be undefined.
     */
    readonly validationStatus?: ValidationStatus<VD>;

    /**
     * Perform sync validations only
     */
    validateSync(): ValidationStatus<VD>;

    /**
     * Perform async validations only. If no onValidateAsync property is
     * defined on this parameter, this doesn't need to be called during
     * validation as it will always return an "ok" status in that case.
     */
    validateAsync(): Promise<ValidationStatus<VD>>;

    /**
     * A callback to do synchronous validation of this parameter
     *
     * @param value The value to validate
     * @returns A ValidationStatus object with the results of the validation
     */
    onValidateSync?(value: V[K]): ValidationStatus<VD>;

    /**
     * A callback to do async validation of this parameter
     *
     * @param value The value to validate
     * @returns A promise which resolves to a ValidationStatus object
     */
    onValidateAsync?(value: V[K]): Promise<ValidationStatus<VD>>;

    /**
     * Get the value of a parameter dependency but do not perform
     * any type checks or conversion.
     *
     * @param dependencyName The name of the dependency
     * @returns The raw value of the dependency
     */
    getDependencyValue<T extends ParameterDependencyName<V, D>>(
        dependencyName: T
    ): unknown;

    /**
     * Get the value of a parameter dependency as a string.
     *
     * @param dependencyName The name of the dependency
     * @returns The string value of the dependency
     */
    getDependencyValueAsString<T extends ParameterDependencyName<V, D>>(
        dependencyName: T
    ): string | undefined;
}

export abstract class AbstractParameter<
    V extends FormValues,
    K extends ParameterName<V> = ParameterName<V>,
    D extends ParameterDependencies<V> = NoDependencies,
    VD = unknown
> implements Parameter<V, K, D, VD>
{
    private _logger: Logger;

    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: K;
    description?: string;
    placeholder?: string;
    dependencies?: D;
    dynamic?: DynamicParameterProperties<V, K>;

    private _disabled?: boolean;
    get disabled(): boolean {
        return (
            (this.parentSection?.disabled ?? false) || (this._disabled ?? false)
        );
    }
    set disabled(value: boolean | undefined) {
        this._disabled = value;
    }

    private _label?: string;
    get label(): string {
        return this._label ?? this.name;
    }
    set label(label: string | undefined) {
        this._label = label;
    }

    private _hidden?: boolean;
    get hidden(): boolean {
        return (this.parentSection?.hidden ?? false) || (this._hidden ?? false);
    }
    set hidden(value: boolean | undefined) {
        this._hidden = value;
    }

    private _hideLabel?: boolean;
    get hideLabel(): boolean {
        return this._hideLabel ?? false;
    }
    set hideLabel(value: boolean | undefined) {
        this._hideLabel = value;
    }

    private _required?: boolean;
    get required(): boolean {
        return this._required ?? false;
    }
    set required(value: boolean | undefined) {
        this._required = value;
    }

    get value(): V[K] {
        return this.parentForm.values[this.name];
    }
    set value(newValue: V[K]) {
        this.parentForm.updateValue(this.name, newValue);
    }

    get validationStatus(): ValidationStatus<VD> | undefined {
        return this.parentForm.entryValidationStatus[
            this.name
        ] as ValidationStatus<VD>;
    }

    constructor(
        parentForm: Form<V>,
        name: K,
        init?: ParameterInit<V, K, D, VD>
    ) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;

        this._logger = getLogger(`FormParameter-${name}`);

        this._label = init?.label;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.hideLabel = init?.hideLabel;
        this.required = init?.required;
        this.dynamic = init?.dynamic;

        if (init?.value !== undefined) {
            this.value = init.value;
        }

        if (init?.dependencies !== undefined) {
            this.dependencies = init.dependencies;
        }

        if (init?.onValidateSync) {
            this.onValidateSync = init.onValidateSync;
        }
        if (init?.onValidateAsync) {
            this.onValidateAsync = init.onValidateAsync;
        }

        (this.parentForm as unknown as FormImpl<V>)._registerEntry(this);
    }

    onValidateSync?(value: V[K]): ValidationStatus<VD>;
    onValidateAsync?(value: V[K]): Promise<ValidationStatus<VD>>;

    validateSync(): ValidationStatus<VD> {
        let status: ValidationStatus<VD> | undefined;

        if (this.required && this.value == null) {
            status = new ValidationStatus<VD>(
                "error",
                `${capitalizeFirst(this.label ?? this.name)} is required`
            );
        }

        if (!status && this.onValidateSync) {
            status = this.onValidateSync(this.value);
        }

        if (!status) {
            status = new ValidationStatus<VD>("ok");
        }

        return status;
    }

    async validateAsync(): Promise<ValidationStatus<VD>> {
        let status: ValidationStatus<VD> | undefined;

        if (this.onValidateAsync) {
            status = await this.onValidateAsync(this.value);
        }

        if (!status) {
            status = new ValidationStatus<VD>("ok");
        }

        return status;
    }

    getDependencyValue(dependencyName: ParameterDependencyName<V, D>): unknown {
        return this._getDependencyValue(dependencyName, (value): string => {
            return String(value);
        });
    }

    getDependencyValueAsString(
        dependencyName: ParameterDependencyName<V, D>
    ): string | undefined {
        return this._getDependencyValue(dependencyName, (value) => {
            if (value != null) {
                if (typeof value !== "string") {
                    this._logger.warn(
                        `Parameter ${this.name} dependency '${dependencyName}' is not a string`
                    );
                    return String(value);
                }
                return value;
            }
            return undefined;
        });
    }

    protected _getDependencyValue<R>(
        dependencyName: ParameterDependencyName<V, D>,
        transform: (value: unknown) => R | undefined
    ) {
        if (!this.dependencies?.[dependencyName]) {
            this._logger.error(
                `Parameter ${this.name} is missing dependency '${dependencyName}'`
            );
            return;
        }
        return transform(
            this.parentForm.values[this.dependencies[dependencyName]]
        );
    }
}
