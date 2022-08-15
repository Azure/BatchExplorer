import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { cloneDeep, OrderedMap } from "../util";

export type FormValues = Record<string, unknown>;

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

    /**
     * The currently displayed error message
     */
    errorMessage?: string;
}

export interface ValuedEntry<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends Entry<V> {
    name: K;
    required?: boolean;
    value?: V[Extract<keyof V, string>];
    validate(): Promise<ValidationStatus>;
}

export interface EntryInit<V extends FormValues> {
    parentSection?: Section<V>;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
}

export interface ValuedEntryInit<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends EntryInit<V> {
    required?: boolean;
    value?: V[K];
    onValidate?: (value: V[K]) => Promise<ValidationStatus>;
}

export interface ParameterInit<
    V extends FormValues,
    K extends Extract<keyof V, string>
> extends ValuedEntryInit<V, K> {
    label?: string;
    hideLabel?: boolean;
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
}

export class ValidationStatus {
    level: "ok" | "warn" | "error";
    message: string;

    constructor(level: "ok" | "warn" | "error", message: string) {
        this.level = level;
        this.message = message;
    }
}

/**
 * A form which may contain child entries, and may be nested inside an entry itself
 * A form's value is an object with key/value pairs representing parameter names
 * and values or subform names and values
 */
export interface Form<V extends FormValues> {
    values: V;

    readonly validationStatus: ValidationStatus | undefined;
    readonly entryValidationStatus: {
        [name in Extract<keyof V, string>]?: ValidationStatus;
    };

    title?: string;
    description?: string;

    childEntriesCount: number;
    allEntriesCount: number;

    _emitter: TypedEmitter<{
        change: (newValues: V, oldValues: V) => void;
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

    updateValue(
        name: Extract<keyof V, string>,
        value: V[Extract<keyof V, string>]
    ): void;

    validate(): Promise<ValidationStatus>;

    ok(entryName: Extract<keyof V, string>, message?: string): void;

    error(entryName: Extract<keyof V, string>, message: string): void;

    warn(entryName: Extract<keyof V, string>, message: string): void;
}

class FormImpl<V extends FormValues> implements Form<V> {
    title?: string;
    description?: string;

    _validationStatus: ValidationStatus | undefined;
    get validationStatus(): ValidationStatus | undefined {
        return this._validationStatus;
    }

    _entryValidationStatus: {
        [name in Extract<keyof V, string>]?: ValidationStatus;
    } = {};
    get entryValidationStatus(): {
        [name in Extract<keyof V, string>]?: ValidationStatus;
    } {
        return this._entryValidationStatus;
    }

    // Because validation can be async, this is used to keep track of
    // the current validation that is in progress, so that the latest
    // one always 'wins'
    _currentValidationPromise: Promise<ValidationStatus[]> | undefined;

    _emitter = new EventEmitter() as TypedEmitter<{
        change: (newValues: V, oldValues: V) => void;
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

    async validate(): Promise<ValidationStatus> {
        const validatingEntries = [];
        const validationPromises = [];
        const newValidationStatuses: { [name in keyof V]?: ValidationStatus } =
            {};

        // Call validate() for each entry but don't block
        // on completion
        for (const entry of this.allEntries()) {
            if (entry instanceof Parameter || entry instanceof SubForm) {
                validatingEntries.push(entry);
                validationPromises.push(
                    entry.validate().then((status) => {
                        newValidationStatuses[entry.name as keyof V] = status;
                        return status;
                    })
                );
            }
        }

        const validationPromise = Promise.all(validationPromises);
        this._currentValidationPromise = validationPromise;

        await validationPromise;

        // Check to make sure this is still the most recent validation
        // attempt. If it is not, return the most recent validation status
        // which has completed. Note that if there hasn't been a validation
        // completed yet, this will run validation even if there is a pending
        // one, and the pending validation will overwrite this validation
        // status when it finishes.
        if (
            this._validationStatus &&
            this._currentValidationPromise !== validationPromise
        ) {
            return this._validationStatus;
        }

        // Clear old validation statuses
        this._validationStatus = undefined;
        this._entryValidationStatus = {};

        // All entries have validated. Update status
        for (const entry of validatingEntries) {
            const entryName = entry.name as Extract<keyof V, string>;
            this._entryValidationStatus[entryName] =
                newValidationStatuses[entryName];
        }

        if (this._currentValidationPromise === validationPromise) {
            // Only clear the current validation promise if this is the
            // most recent one
            this._currentValidationPromise = undefined;
        }

        const overallStatus = this._computeOverallValidationStatus();
        this._validationStatus = overallStatus;

        return overallStatus;
    }

    ok(entryName: Extract<keyof V, string>, message?: string): void {
        this._entryValidationStatus[entryName] = new ValidationStatus(
            "ok",
            message ?? ""
        );
        this._validationStatus = this._computeOverallValidationStatus();
    }

    error(entryName: Extract<keyof V, string>, message: string): void {
        this._entryValidationStatus[entryName] = new ValidationStatus(
            "error",
            message
        );
        this._validationStatus = this._computeOverallValidationStatus();
    }

    warn(entryName: Extract<keyof V, string>, message: string): void {
        const currentEntry = this._entryValidationStatus[entryName];
        if (currentEntry && currentEntry.level === "error") {
            // Don't overwrite error messages with warning messages
            return;
        }
        this._entryValidationStatus[entryName] = new ValidationStatus(
            "warn",
            message
        );
        this._validationStatus = this._computeOverallValidationStatus();
    }

    private _computeOverallValidationStatus(): ValidationStatus {
        let warningCount = 0;
        let errorCount = 0;
        for (const entry of Object.values(this._entryValidationStatus)) {
            if (entry) {
                if (entry.level === "warn") {
                    warningCount++;
                } else if (entry.level === "error") {
                    errorCount++;
                }
            }
        }

        let overallStatus: ValidationStatus;
        if (errorCount > 0) {
            overallStatus = new ValidationStatus(
                "error",
                `${errorCount} ${errorCount === 1 ? "error" : "errors"} found`
            );
        } else if (warningCount > 0) {
            overallStatus = new ValidationStatus(
                "warn",
                `${warningCount} warnings found`
            );
        } else {
            overallStatus = new ValidationStatus("ok", "Validation passed");
        }

        return overallStatus;
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
> implements Entry<P>, Form<S>
{
    readonly parentForm: Form<P>;
    readonly parentSection?: Section<P>;

    name: PK;
    form: Form<S>;

    _title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
    expanded?: boolean;

    _emitter = new EventEmitter() as TypedEmitter<{
        change: (newValues: S, oldValues: S) => void;
    }>;

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
        this.errorMessage = init?.errorMessage;
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

    updateValue(
        name: Extract<keyof S, string>,
        value: S[Extract<keyof S, string>]
    ): void {
        this.form.updateValue(name, value);
    }

    async validate(): Promise<ValidationStatus> {
        return this.form.validate();
    }

    ok(entryName: Extract<keyof S, string>): void {
        this.form.ok(entryName);
    }

    error(entryName: Extract<keyof S, string>, message: string): void {
        this.form.error(entryName, message);
    }

    warn(entryName: Extract<keyof S, string>, message: string): void {
        this.form.warn(entryName, message);
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
    disabled?: boolean;
    errorMessage?: string;
    hidden?: boolean;
    hideLabel?: boolean;
    inactive?: boolean;
    required?: boolean;

    onValidate?: (value: V[K]) => Promise<ValidationStatus>;

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
        this.disabled = init?.disabled;
        this.errorMessage = init?.errorMessage;
        this.hidden = init?.hidden;
        this.hideLabel = init?.hideLabel;
        this.inactive = init?.inactive;
        this.required = init?.required;

        if (init?.value !== undefined) {
            this.value = init.value;
        }

        if (init?.onValidate) {
            this.onValidate = init.onValidate;
        }

        (this.parentForm as FormImpl<V>)._registerEntry(
            this,
            init?.dependencies
        );
    }

    async validate(): Promise<ValidationStatus> {
        let status: ValidationStatus | undefined;

        if (this.required && this.value == null) {
            status = new ValidationStatus("error", "Value must not be empty");
        }

        if (!status && this.onValidate) {
            status = await this.onValidate(this.value);
        }

        if (!status) {
            status = new ValidationStatus("ok", "Validation passed");
        }

        return status;
    }
}

export class Section<V extends FormValues> {
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: string;
    _title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
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
        this.errorMessage = init?.errorMessage;
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
