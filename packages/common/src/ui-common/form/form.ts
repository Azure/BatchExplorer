import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import {
    capitalizeFirst,
    cloneDeep,
    Deferred,
    delay,
    OrderedMap,
} from "../util";

export type FormValues = Record<string, unknown>;

// If there is an async validation in progress, how long to wait before
// calling another async validation.
const asyncValidationDelay = 300;

/**
 * Create a new Form
 *
 * @param initialValues The initial values of the form
 * @returns The newly-created form
 */
export function createForm<V extends FormValues>(init: FormInit<V>): Form<V> {
    return new FormImpl(init);
}

export function isForm<V extends FormValues>(obj: unknown): obj is Form<V> {
    return obj instanceof FormImpl;
}

export enum ParameterType {
    String = "String",
    StringList = "StringList",
    Number = "Number",
    Boolean = "Boolean",
}

export interface Entry<V extends FormValues> {
    name: string;

    parentForm: Form<V>;

    parentSection?: Section<V>;

    /**
     * A short title
     */
    title?: string;

    /**
     * A long-form description
     */
    description?: string;

    /**
     * If true, the associated control will be greyed out and
     * non-interactive.
     */
    disabled?: boolean;

    /**
     * If true, the associated control will be visibly hidden
     */
    hidden?: boolean;

    /**
     * While true, the associated control's value will be ignored by the
     * form and will not react to changes.
     */
    inactive?: boolean;
}

export interface ValuedEntry<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends Entry<V> {
    name: K;
    value?: V[K];
}

export interface EntryInit<V extends FormValues> {
    parentSection?: Section<V>;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
}

export interface ValuedEntryInit<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends EntryInit<V> {
    value?: V[K];
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
    dependencies?: [keyof V];
}

export interface SubFormInit<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends ValuedEntryInit<V, K> {
    title?: string;
    expanded?: boolean;
}

export interface SectionInit<V extends FormValues> extends EntryInit<V> {
    title?: string;
    expanded?: boolean;
}

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

export class ValidationStatus {
    level: "ok" | "warn" | "error" | "canceled";
    message?: string;

    constructor(level: "ok" | "warn" | "error" | "canceled", message?: string) {
        this.level = level;
        this.message = message;
    }
}

export type ValidationOpts = {
    /**
     * Force this validation to go through to the end and not be canceled by
     * subsequent validation calls. Useful for final form validation before
     * submission.
     */
    force?: boolean;
};

const defaultValidationOpts = { force: false };

export type FormChangeHandler<V> = (newValues: V, oldValues: V) => void;

/**
 * A form which may contain child entries, and may be nested inside an entry itself
 * A form's value is an object with key/value pairs representing parameter names
 * and values or subform names and values
 */
export interface Form<V extends FormValues> {
    values: V;

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

    onChange(handler: FormChangeHandler<V>): FormChangeHandler<V>;

    removeOnChange(handler: FormChangeHandler<V>): void;
}

export class ValidationSnapshot<V extends FormValues> {
    values: V;

    overallStatus: ValidationStatus | undefined;
    onValidateSyncStatus: ValidationStatus | undefined;
    onValidateAsyncStatus: ValidationStatus | undefined;

    entryStatus: {
        [name in Extract<keyof V, string>]?: ValidationStatus;
    } = {};

    syncValidationComplete: boolean = false;
    asyncValidationComplete: boolean = false;

    get allValidationComplete(): boolean {
        return (
            this.overallStatus != null &&
            this.syncValidationComplete &&
            this.asyncValidationComplete
        );
    }

    readonly isInitialSnapshot: boolean;
    readonly validationCompleteDeferred: Deferred<void> = new Deferred();

    constructor(formValues: V, isFirstSnapshot: boolean = false) {
        this.values = formValues;
        this.isInitialSnapshot = isFirstSnapshot;
    }

    ok<K extends Extract<keyof V, string>>(
        entryName: K,
        message?: string
    ): void {
        this.entryStatus[entryName] = new ValidationStatus("ok", message ?? "");
    }

    error<K extends Extract<keyof V, string>>(
        entryName: K,
        message: string
    ): void {
        this.entryStatus[entryName] = new ValidationStatus("error", message);
    }

    warn<K extends Extract<keyof V, string>>(
        entryName: K,
        message: string
    ): void {
        this.entryStatus[entryName] = new ValidationStatus("warn", message);
    }

    updateOverallStatus(): void {
        let warningCount = 0;
        let errorCount = 0;
        let lastWarningMsg: string | undefined;
        let lastErrorMsg: string | undefined;
        for (const entry of Object.values(this.entryStatus)) {
            if (entry) {
                if (entry.level === "warn") {
                    warningCount++;
                    lastWarningMsg = entry.message;
                } else if (entry.level === "error") {
                    errorCount++;
                    lastErrorMsg = entry.message;
                }
            }
        }

        let overallStatus: ValidationStatus;
        if (errorCount > 0) {
            let errorMsg: string;
            if (errorCount === 1 && lastErrorMsg) {
                errorMsg = lastErrorMsg;
            } else {
                errorMsg = `${errorCount} ${
                    errorCount === 1 ? "error" : "errors"
                } found`;
            }
            overallStatus = new ValidationStatus("error", errorMsg);
        } else if (warningCount > 0) {
            let warningMsg: string;
            if (warningCount === 1 && lastWarningMsg) {
                warningMsg = lastWarningMsg;
            } else {
                warningMsg = `${warningCount} ${
                    warningCount === 1 ? "warning" : "warnings"
                } found`;
            }
            overallStatus = new ValidationStatus("warn", warningMsg);
        } else {
            overallStatus = new ValidationStatus("ok");
        }

        if (overallStatus.level === "ok" && this.onValidateSyncStatus) {
            overallStatus = this.onValidateSyncStatus;
        }

        if (overallStatus.level === "ok" && this.onValidateAsyncStatus) {
            overallStatus = this.onValidateAsyncStatus;
        }

        this.overallStatus = overallStatus;
    }
}

class FormImpl<V extends FormValues> implements Form<V> {
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

    get validationSnapshot(): ValidationSnapshot<V> {
        return this._validationSnapshot;
    }

    get validationStatus(): ValidationStatus | undefined {
        return this._validationSnapshot?.overallStatus;
    }

    get entryValidationStatus(): {
        [name in Extract<keyof V, string>]?: ValidationStatus;
    } {
        return this._validationSnapshot.entryStatus;
    }

    // The currently validation state. Note that this can be superceded by
    // another snapshot before validation finishes when validate() is called
    // again
    private _validationSnapshot: ValidationSnapshot<V> = new ValidationSnapshot(
        this.values,
        true
    );

    _emitter = new EventEmitter() as TypedEmitter<{
        change: (newValues: V, oldValues: V) => void;
        validate: (snapshot: ValidationSnapshot<V>) => void;
    }>;

    get childEntriesCount(): number {
        return this._childEntries.size;
    }

    get allEntriesCount(): number {
        return this._allEntries.size;
    }

    private _values: V;

    get values(): V {
        return this._values;
    }

    set values(newValues: V) {
        const oldValues = this._values;
        this._values = newValues;

        if (oldValues !== newValues) {
            this._emitChangeEvent(newValues, oldValues);
        }
    }

    /**
     * Includes all entries for the entire form, including nested parameters,
     * sections and subforms, but *not* entries inside form objects associated
     * with subforms.
     */
    private _allEntries: Map<string, Entry<V>> = new Map();

    /**
     * Only includes direct children of the form (not those inside sections).
     * Ordered in display-order.
     */
    private _childEntries: OrderedMap<string, Entry<V>> = new OrderedMap();

    /**
     * Collection for looking up other entries whose value this entry depends
     * on.
     */
    private _entryDependencies: Map<string, string[]> = new Map();

    constructor(init: FormInit<V>) {
        this._values = init.values;
        this.title = init.title;
        this.description = init.description;

        if (init.onValidateSync) {
            this.onValidateSync = init.onValidateSync;
        }
        if (init.onValidateAsync) {
            this.onValidateAsync = init.onValidateAsync;
        }
    }

    childEntries(): IterableIterator<Entry<V>> {
        return this._childEntries.values();
    }

    allEntries(): IterableIterator<Entry<V>> {
        return this._allEntries.values();
    }

    getEntry(entryName: string): Entry<V> | undefined {
        return this._allEntries.get(entryName);
    }

    param<K extends Extract<keyof V, string>>(
        name: K,
        type: string,
        init?: ParameterInit<V, K>
    ): Parameter<V, K> {
        return new Parameter(this, name, type, init);
    }

    getParam<K extends Extract<keyof V, string>>(name: K): Parameter<V, K> {
        const entry = this.getEntry(name);
        if (!(entry instanceof Parameter)) {
            throw new Error(`Entry "${name}" is not a parameter`);
        }
        return entry;
    }

    section(name: string, init?: SectionInit<V>): Section<V> {
        return new Section(this, name, init);
    }

    getSection(name: string): Section<V> {
        const entry = this.getEntry(name);
        if (!(entry instanceof Section)) {
            throw new Error(`Entry "${name}" is not a section`);
        }
        return entry;
    }

    subForm<K extends Extract<keyof V, string>, S extends V[K] & FormValues>(
        name: K,
        form: Form<S>,
        init?: SubFormInit<V, K>
    ): SubForm<V, K, S> {
        return new SubForm(this, name, form, init);
    }

    getSubForm<K extends Extract<keyof V, string>, S extends V[K] & FormValues>(
        name: K
    ): SubForm<V, K, S> {
        const entry = this.getEntry(name);
        if (!(entry instanceof SubForm)) {
            throw new Error(`Entry "${name}" is not a sub-form`);
        }
        return entry;
    }

    private _emitChangeEvent(newValues: V, oldValues: V) {
        this._emitter.emit("change", newValues, oldValues);
    }

    private _emitValidateEvent(snapshot: ValidationSnapshot<V>) {
        this._emitter.emit("validate", snapshot);
    }

    /**
     * Update form values by creating a copy and setting the new values object
     *
     * @param name The name of the entry to update values for
     * @param value The new value
     */
    updateValue<K extends Extract<keyof V, string>>(
        name: K,
        value: V[K]
    ): void {
        const newValues = cloneDeep(this.values);
        newValues[name] = value;
        this.values = newValues;
    }

    async validate(opts?: ValidationOpts): Promise<ValidationSnapshot<V>> {
        if (!opts) {
            opts = defaultValidationOpts;
        }

        const snapshot = new ValidationSnapshot(this.values);
        const previousValidationInProgress =
            this._validationSnapshot.validationCompleteDeferred.done !== true;

        this._validationSnapshot = snapshot;
        this.validateSync(snapshot, opts);

        // Fire a validation event to allow updates after synchronous
        // validation to happen immediately
        this._emitValidateEvent(snapshot);

        // Yield before doing any async validation to check if another validation
        // attempt has come in.
        let delayMs = 0;
        if (
            !opts.force &&
            !this._validationSnapshot.isInitialSnapshot &&
            previousValidationInProgress
        ) {
            // Go more slowly if there is an async validation in progress to
            // avoid performing too many expensive operations
            delayMs = asyncValidationDelay;
        }
        await delay(delayMs);

        if (this._checkAndCancelValidationSnapshot(snapshot, opts.force)) {
            return snapshot;
        }

        await this.validateAsync(snapshot, opts);

        if (this._checkAndCancelValidationSnapshot(snapshot, opts.force)) {
            return snapshot;
        }

        // This snapshot is done, and is now the current in-effect snapshot
        snapshot.validationCompleteDeferred.resolve();
        snapshot.updateOverallStatus();
        this._validationSnapshot = snapshot;

        this._emitValidateEvent(snapshot);

        if (!snapshot.overallStatus) {
            // Hitting this indicates a bug. This shouldn't ever be undefined
            // at this point.
            throw new Error("Failed to compute overall validation status");
        }

        return snapshot;
    }

    validateSync(
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ): ValidationSnapshot<V> {
        // Call validateAsync() for each entry but don't block
        // on completion
        for (const entry of this.allEntries()) {
            if (entry instanceof Parameter) {
                const entryName = entry.name as Extract<keyof V, string>;
                snapshot.entryStatus[entryName] = entry.validateSync();
            } else if (entry instanceof SubForm) {
                entry.validateSync(entry.form.validationSnapshot, opts);

                const entryName = entry.name as Extract<keyof V, string>;
                // Note: this will often be undefined because full
                //       validation hasn't run
                snapshot.entryStatus[entryName] =
                    entry.form.validationSnapshot.overallStatus;
            }
        }

        // Run overall form onValidateSync callback
        if (this.onValidateSync) {
            snapshot.onValidateSyncStatus = this.onValidateSync(snapshot, opts);
        }

        return snapshot;
    }

    async validateAsync(
        snapshot: ValidationSnapshot<V>,
        opts: ValidationOpts
    ): Promise<ValidationSnapshot<V>> {
        const validatingEntries = [];
        const validationPromises = [];
        const newValidationStatuses: { [name in keyof V]?: ValidationStatus } =
            {};

        // Call validateAsync() for each entry but don't block
        // on completion
        for (const entry of this.allEntries()) {
            const entryName = entry.name as Extract<keyof V, string>;
            if (entry instanceof Parameter) {
                if (snapshot.entryStatus[entryName]?.level === "error") {
                    // Don't run async validation if sync validation
                    // has already failed for this parameter
                    continue;
                }

                validatingEntries.push(entry);
                validationPromises.push(
                    entry.validateAsync().then((status) => {
                        newValidationStatuses[entryName] = status;
                        return status;
                    })
                );
            } else if (entry instanceof SubForm) {
                validatingEntries.push(entry);
                validationPromises.push(
                    entry
                        .validateAsync(entry.form.validationSnapshot, opts)
                        .then((snapshot) => {
                            newValidationStatuses[entryName] =
                                snapshot.overallStatus;
                            return snapshot.overallStatus;
                        })
                );
            }
        }

        await Promise.all(validationPromises);

        if (this._checkAndCancelValidationSnapshot(snapshot, opts.force)) {
            return snapshot;
        }

        // All entries have validated
        for (const entry of validatingEntries) {
            const entryName = entry.name as Extract<keyof V, string>;
            if (snapshot.entryStatus[entryName]?.level !== "error") {
                snapshot.entryStatus[entryName] =
                    newValidationStatuses[entryName];
            }
        }

        // Run overall form onValidateAsync callback
        if (this.onValidateAsync) {
            snapshot.onValidateAsyncStatus = await this.onValidateAsync(
                snapshot,
                opts
            );
        }

        return snapshot;
    }

    /**
     * Checks to make sure the current validation snapshot is the most recent.
     * If not, sets the validation status to error with a message saying
     * the validation was canceled.
     *
     * @return True if the snapshot was canceled. False otherwise.
     */
    private _checkAndCancelValidationSnapshot(
        snapshot: ValidationSnapshot<V>,
        isFinalValidation?: boolean
    ): boolean {
        if (!isFinalValidation && this._validationSnapshot !== snapshot) {
            snapshot.overallStatus = new ValidationStatus(
                "canceled",
                "Validation canceled"
            );
            snapshot.validationCompleteDeferred.resolve();
            return true;
        }
        return false;
    }

    async waitForValidation(): Promise<ValidationStatus | undefined> {
        // Yield to give a chance for other blocking calls to validate()
        // to happen first
        await delay();

        while (true) {
            const lastSeenSnapshot = this._validationSnapshot;
            if (!lastSeenSnapshot) {
                break;
            }

            // There is validation in progress. Wait for it to finish
            // before resolving our promise.
            await lastSeenSnapshot.validationCompleteDeferred.promise;

            // If the snapshot we were waiting on is still the most
            // recent, we're done. Otherwise continue to loop and wait for the
            // new validation promise.
            if (lastSeenSnapshot === this._validationSnapshot) {
                break;
            }
        }
        return this.validationStatus;
    }

    onChange(handler: FormChangeHandler<V>): FormChangeHandler<V> {
        this._emitter.addListener("change", handler);
        return handler;
    }

    removeOnChange(handler: FormChangeHandler<V>): void {
        this._emitter.removeListener("change", handler);
    }

    /**
     * Internal method to register a new entry in this form.
     *
     * Note this isn't truly private because it is called by form entries
     * when they are created, but because it only exists on the implementation,
     * not the Form interface, it is effectively private to this file.
     *
     * @param entry The entry to register
     * @param dependencies Names of other parameters this entry depends on
     */
    _registerEntry(entry: Entry<V>, dependencies?: [keyof V]): void {
        if (this._allEntries.has(entry.name)) {
            throw new Error(
                `An entry named "${entry.name}" already exists in the form`
            );
        }
        this._allEntries.set(entry.name, entry);
        if (!entry.parentSection) {
            // This isn't inside a section, so it's a direct child of the form
            this._childEntries.set(entry.name, entry);
        }

        if (dependencies) {
            this.addDependencies(entry, dependencies);
        }
    }

    private addDependencies(entry: Entry<V>, dependencies: [keyof V]): void {
        const entryDeps = this._entryDependencies.get(entry.name) ?? [];
        for (const dep in dependencies) {
            entryDeps.push(dep);
        }
        this._entryDependencies.set(entry.name, entryDeps);
    }
}

export class SubForm<
    P extends FormValues,
    PK extends Extract<keyof P, string>,
    S extends P[PK] & FormValues
> implements ValuedEntry<P, PK>, Form<S>
{
    readonly parentForm: Form<P>;
    readonly parentSection?: Section<P>;

    name: PK;
    form: Form<S>;

    _title?: string;
    description?: string;
    dirty?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    expanded?: boolean;

    _emitter = new EventEmitter() as TypedEmitter<{
        change: (newValues: S, oldValues: S) => void;
        validate: (snapshot: ValidationSnapshot<S>) => void;
    }>;

    get validationSnapshot(): ValidationSnapshot<S> {
        return this.form.validationSnapshot;
    }

    get validationStatus(): ValidationStatus | undefined {
        return this.form.validationStatus;
    }

    get entryValidationStatus(): {
        [name in Extract<keyof S, string>]?: ValidationStatus;
    } {
        return this.form.entryValidationStatus;
    }

    get title(): string {
        return this._title ?? this.name;
    }

    set title(title: string) {
        this._title = title;
    }

    get childEntriesCount(): number {
        return this.form.childEntriesCount;
    }

    get allEntriesCount(): number {
        return this.form.allEntriesCount;
    }

    get values(): S {
        return this.form.values;
    }

    set values(newValues: S) {
        this.form.values = newValues;
    }

    constructor(
        parentForm: Form<P>,
        name: PK,
        form: Form<S>,
        init?: SubFormInit<P, PK>
    ) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;
        this.form = form;

        this._title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.inactive = init?.inactive;
        this.expanded = init?.expanded;

        this.parentForm.values[name] = this.form.values;

        (this.parentForm as FormImpl<P>)._registerEntry(this);
    }

    childEntries(): IterableIterator<Entry<S>> {
        return this.form.childEntries();
    }

    allEntries(): IterableIterator<Entry<S>> {
        return this.form.allEntries();
    }

    getEntry(entryName: string): Entry<S> | undefined {
        return this.form.getEntry(entryName);
    }

    param<SK extends Extract<keyof S, string>>(
        name: SK,
        type: string,
        init?: ParameterInit<S, SK>
    ): Parameter<S, SK> {
        return this.form.param(name, type, init);
    }

    getParam<SK extends Extract<keyof S, string>>(name: SK): Parameter<S, SK> {
        return this.form.getParam(name);
    }

    section(name: string, init?: SectionInit<S>): Section<S> {
        return this.form.section(name, init);
    }

    getSection(name: string): Section<S> {
        return this.form.getSection(name);
    }

    subForm<SK extends Extract<keyof S, string>, S2 extends S[SK] & FormValues>(
        name: SK,
        form: Form<S2>
    ): SubForm<S, SK, S2> {
        return new SubForm(this.form, name, form);
    }

    getSubForm<
        SK extends Extract<keyof S, string>,
        S2 extends S[SK] & FormValues
    >(name: SK): SubForm<S, SK, S2> {
        return this.form.getSubForm(name);
    }

    updateValue<SK extends Extract<keyof S, string>, S2 extends S[SK]>(
        name: SK,
        value: S2
    ): void {
        this.form.updateValue(name, value);
    }

    async validate(opts?: ValidationOpts): Promise<ValidationSnapshot<S>> {
        return this.form.validate(opts);
    }

    validateSync(
        snapshot: ValidationSnapshot<S>,
        opts: ValidationOpts
    ): ValidationSnapshot<S> {
        return this.form.validateSync(snapshot, opts);
    }

    async validateAsync(
        snapshot: ValidationSnapshot<S>,
        opts: ValidationOpts
    ): Promise<ValidationSnapshot<S>> {
        return this.form.validateAsync(snapshot, opts);
    }

    async waitForValidation(): Promise<ValidationStatus | undefined> {
        return this.form.waitForValidation();
    }

    onChange(handler: FormChangeHandler<S>): FormChangeHandler<S> {
        return this.form.onChange(handler);
    }

    removeOnChange(handler: FormChangeHandler<S>): void {
        this.form.removeOnChange(handler);
    }
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
        if (this.parentForm.values[this.name] !== newValue) {
            const oldValue = this.parentForm.values[this.name];
            if (oldValue !== newValue) {
                this.parentForm.updateValue(this.name, newValue);
            }
        }
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

        (this.parentForm as FormImpl<V>)._registerEntry(
            this,
            init?.dependencies
        );
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

export class Section<V extends FormValues> implements Entry<V> {
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: string;
    _title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    expanded?: boolean;

    private _childEntries: OrderedMap<string, Entry<V>> = new OrderedMap();

    get childEntriesCount(): number {
        return this._childEntries.size;
    }

    get title(): string {
        return this._title ?? this.name;
    }

    set title(title: string) {
        this._title = title;
    }

    constructor(parentForm: Form<V>, name: string, init?: SectionInit<V>) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;
        this._title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.inactive = init?.inactive;
        this.expanded = init?.expanded;

        (this.parentForm as FormImpl<V>)._registerEntry(this);
    }

    childEntries(): IterableIterator<Entry<V>> {
        return this._childEntries.values();
    }

    getEntry(entryName: string): Entry<V> | undefined {
        return this._childEntries.get(entryName);
    }

    param<K extends Extract<keyof V, string>>(
        name: K,
        type: string,
        init?: ParameterInit<V, K>
    ): Parameter<V, K> {
        const paramInit = init ?? {};
        paramInit.parentSection = this;

        const param = new Parameter(this.parentForm, name, type, paramInit);
        this._childEntries.set(name, param);

        return param;
    }

    section(name: string, init?: SectionInit<V>): Section<V> {
        const sectionInit = init ?? {};
        sectionInit.parentSection = this;

        const section = new Section(this.parentForm, name, sectionInit);
        this._childEntries.set(name, section);

        return section;
    }

    subForm<K extends Extract<keyof V, string>, S extends V[K] & FormValues>(
        name: K,
        form: Form<S>,
        init?: SubFormInit<V, K>
    ): SubForm<V, K, S> {
        const subFormInit = init ?? {};
        subFormInit.parentSection = this;

        const subForm = new SubForm(this.parentForm, name, form, subFormInit);
        this._childEntries.set(name, subForm);

        return subForm;
    }
}
