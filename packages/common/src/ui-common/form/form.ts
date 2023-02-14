import TypedEmitter from "typed-emitter";
import { Entry } from "./entry";
import { Parameter, ParameterInit } from "./parameter";
import { Section, SectionInit } from "./section";
import { SubForm, SubFormInit } from "./subform";
import { ValidationSnapshot } from "./validation-snapshot";
import { ValidationStatus } from "./validation-status";

export type FormValues = Record<string, unknown>;

export interface FormInit<V extends FormValues> {
    values: V;
    title?: string;
    description?: string;
    onValidateSync?: (
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ) => ValidationStatus;
    onValidateAsync?: (
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ) => Promise<ValidationStatus>;
}

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
        [name in Extract<keyof V, string>]?: ValidationStatus;
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

    param<K extends Extract<keyof V, string>>(
        name: K,
        type: string,
        init?: ParameterInit<V, K>
    ): Parameter<V, K>;

    getParam<K extends Extract<keyof V, string>>(name: K): Parameter<V, K>;

    section(name: string, init?: SectionInit<V>): Section<V>;

    getSection(name: string): Section<V>;

    subForm<K extends Extract<keyof V, string>, S extends V[K] & FormValues>(
        name: K,
        form: Form<S>,
        init?: SubFormInit<V, K>
    ): SubForm<V, K, S>;

    getSubForm<K extends Extract<keyof V, string>, S extends V[K] & FormValues>(
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
    updateValue<K extends Extract<keyof V, string>>(name: K, value: V[K]): void;

    onValidateSync?: (
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ) => ValidationStatus;

    onValidateAsync?: (
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ) => Promise<ValidationStatus>;

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
}
