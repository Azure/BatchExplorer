import type TypedEmitter from "typed-emitter";
import type { Entry, EntryInit } from "./entry";
import { FormImpl } from "./internal/form-impl";
import { Item } from "./item";
import type {
    Parameter,
    ParameterConstructor,
    ParameterDependencies,
    ParameterInit,
    ParameterName,
} from "./parameter";
import type { Section, SectionInit } from "./section";
import type { SubForm, SubFormInit } from "./subform";
import type { ValidationSnapshot } from "./validation-snapshot";
import type { ValidationStatus } from "./validation-status";

export type FormValues = Record<string, unknown>;

export interface FormInit<V extends FormValues> {
    values: V;
    title?: string;
    description?: string;
    onValidateSync?: (values: V) => ValidationStatus;
    onValidateAsync?: (values: V) => Promise<ValidationStatus>;
}

export type DynamicFormProperty<V extends FormValues, T> = (values: V) => T;

export type ValidationOpts = {
    /**
     * Force this validation to go through to the end and not be canceled by
     * subsequent validation calls. Useful for final form validation before
     * submission.
     */
    force?: boolean;
};

export type FormEventMap<V extends FormValues> = {
    change: (newValues: V, oldValues: V) => void;
    validate: (snapshot: ValidationSnapshot<V>) => void;
};

/**
 * A form which may contain child entries, and may be nested inside an entry itself
 * A form's value is an object with key/value pairs representing parameter names
 * and values or subform names and values
 */
export interface Form<V extends FormValues> {
    readonly values: Readonly<V>;

    readonly validationSnapshot: ValidationSnapshot<V>;
    readonly validationStatus?: ValidationStatus;
    readonly entryValidationStatus: {
        [name in ParameterName<V>]?: ValidationStatus;
    };

    title?: string;
    description?: string;

    childEntriesCount: number;
    allEntriesCount: number;

    _emitter: TypedEmitter<{
        change: (newValues: V, oldValues: V) => void;
        validate: (snapshot?: ValidationSnapshot<V>) => void;
    }>;

    childEntries(): IterableIterator<Entry<V>>;

    allEntries(): IterableIterator<Entry<V>>;

    getEntry(entryName: string): Entry<V> | undefined;

    item(name: string, init?: EntryInit<V>): Item<V>;

    param<
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>,
        T extends Parameter<V, K, D> = Parameter<V, K, D>
    >(
        name: K,
        parameterConstructor: ParameterConstructor<V, K, D, T>,
        init?: ParameterInit<V, K, D>
    ): T;

    getParam<K extends ParameterName<V>>(name: K): Parameter<V, K>;

    section(name: string, init?: SectionInit<V>): Section<V>;

    getSection(name: string): Section<V>;

    subForm<K extends ParameterName<V>, S extends V[K] & FormValues>(
        name: K,
        form: Form<S>,
        init?: SubFormInit<V, K>
    ): SubForm<V, K, S>;

    getSubForm<K extends ParameterName<V>, S extends V[K] & FormValues>(
        name: K
    ): SubForm<V, K, S>;

    /**
     * Set all form values
     *
     * @param values The new values
     */
    setValues(values: V): void;

    /**
     * Update a single form value
     *
     * @param name The name of the entry to update the value for
     * @param value The new value
     */
    updateValue<K extends ParameterName<V>>(name: K, value: V[K]): void;

    /**
     * Reset the form to the initial values it was constructed with
     */
    reset(): void;

    onValidateSync?: (values: V) => ValidationStatus;

    onValidateAsync?: (values: V) => Promise<ValidationStatus>;

    /**
     * Perform all form validation
     * @param opts Validation options
     */
    validate(opts?: ValidationOpts): Promise<ValidationSnapshot<V>>;

    /**
     * Perform synchronous validation
     * @param opts Validation options
     */
    validateSync(
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ): ValidationSnapshot<V>;

    /**
     * Perform asynchronous validation
     * @param opts Validation options
     */
    validateAsync(
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ): Promise<ValidationSnapshot<V>>;

    /**
     * Returns a promise that resolves when any current form validation is
     * finished. If there is no validation in progress, returns a promise which
     * resolves to either undefined (if no validation has been performed) or the
     * current validation status.
     */
    waitForValidation(): Promise<ValidationStatus | undefined>;

    /**
     * Subscribe to form events. When the form event is triggered, the handler
     * is called. This method returns the handler as a convenience to allow for
     * easy cleanup.
     * @param event The type of event to listen to
     * @param handler The callback invoked when the event is triggered
     * @see off()
     */
    on<E extends keyof FormEventMap<V>>(
        event: E,
        handler: FormEventMap<V>[E]
    ): FormEventMap<V>[E];

    /**
     * Unsubscribe from form events
     * @param event The type of event to unsubscribe from
     * @param handler The handler to remove
     * @see on()
     */
    off<E extends keyof FormEventMap<V>>(
        event: E,
        handler: FormEventMap<V>[E]
    ): void;

    /**
     * Externally sets the validation status of the form. Note that the next
     * time validation runs, this status will be cleared.
     *
     * @param status The validation to set.
     */
    forceValidationStatus(status: ValidationStatus): void;

    /**
     * Evaluate dynamic properties
     *
     * @returns True if the evaluation resulted in changes (and a change event
     *          being fired), false otherwise
     */
    evaluate(): boolean;
}

/**
 * Create a new Form
 *
 * @param initialValues The initial values of the form
 * @returns The newly-created form
 */
export function createForm<V extends FormValues>(init: FormInit<V>): Form<V> {
    return new FormImpl(init);
}

/**
 * Type guard for form objects
 *
 * @param obj The object to check
 * @returns True if the object is a Form, false otherwise
 */
export function isForm<V extends FormValues>(obj: unknown): obj is Form<V> {
    return obj instanceof FormImpl;
}
