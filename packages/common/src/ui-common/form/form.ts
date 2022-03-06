import { EventEmitter } from "events";
import TypedEmitter from "typed-emitter";
import { cloneDeep } from "../util";

/**
 * Create a new Form
 *
 * @param initialValues The initial values of the form
 * @returns The newly-created form
 */
export function createForm<FormValues extends Record<string, unknown>>(
    init: FormInit<FormValues>
): Form<FormValues> {
    return new FormImpl(init);
}

export function isForm<FormValues extends Record<string, unknown>>(
    obj: unknown
): obj is Form<FormValues> {
    return obj instanceof FormImpl;
}

export enum ParameterType {
    String = "String",
    StringList = "StringList",
    Number = "Number",
    Boolean = "Boolean",
}

export interface Entry<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> {
    name: EntryName;

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
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> extends Entry<FormValues, EntryName> {
    value?: FormValues[EntryName];
}

export interface ContainerEntry<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> extends Entry<FormValues, EntryName> {
    param<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        type: string,
        init?: ParameterInit<FormValues, EntryName>
    ): Parameter<FormValues, EntryName>;

    section<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        init?: SectionInit
    ): Section<FormValues, EntryName>;
}

export interface EntryInit {
    title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
}

export interface ValuedEntryInit<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> extends EntryInit {
    value?: FormValues[EntryName];
}

export interface ParameterInit<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> extends ValuedEntryInit<FormValues, EntryName> {
    title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
}

export interface SubFormInit extends EntryInit {
    expanded?: boolean;
}

export interface SectionInit extends EntryInit {
    expanded?: boolean;
}

export interface FormInit<FormValues extends Record<string, unknown>> {
    values: FormValues;
    title?: string;
    description?: string;
}

/**
 * A form which may contain child entries, and may be nested inside an entry itself
 * A form's value is an object with key/value pairs representing parameter names
 * and values or subform names and values
 */
export interface Form<FormValues extends Record<string, unknown>> {
    values: FormValues;
    readonly entryMap: Map<
        string,
        Entry<FormValues, Extract<keyof FormValues, string>>
    >;

    title?: string;
    description?: string;

    _emitter: TypedEmitter<{
        change: (newValues: FormValues, oldValues: FormValues) => void;
    }>;

    updateValue<EntryName extends keyof FormValues>(
        name: EntryName,
        value: FormValues[EntryName]
    ): void;

    param<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        type: string,
        init?: ParameterInit<FormValues, EntryName>
    ): Parameter<FormValues, EntryName>;

    getParam<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName
    ): Parameter<FormValues, EntryName>;

    section<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        init?: SectionInit
    ): Section<FormValues, EntryName>;

    getSection<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName
    ): Section<FormValues, EntryName>;

    subForm<
        EntryName extends Extract<keyof FormValues, string>,
        SubFormValues extends FormValues[EntryName] & Record<string, unknown>
    >(
        name: EntryName,
        form: Form<SubFormValues>
    ): SubForm<FormValues, EntryName, SubFormValues>;

    getSubForm<
        EntryName extends Extract<keyof FormValues, string>,
        SubFormValues extends FormValues[EntryName] & Record<string, unknown>
    >(
        name: EntryName
    ): SubForm<FormValues, EntryName, SubFormValues>;
}

class FormImpl<FormValues extends Record<string, unknown>>
    implements Form<FormValues>
{
    title?: string;
    description?: string;

    _emitter = new EventEmitter() as TypedEmitter<{
        change: (newValues: FormValues, oldValues: FormValues) => void;
    }>;

    private _values: FormValues;

    get values(): FormValues {
        return this._values;
    }

    set values(newValues: FormValues) {
        const oldValues = this._values;
        this._values = newValues;

        if (oldValues !== newValues) {
            this._emitChangeEvent(newValues, oldValues);
        }
    }

    /**
     * Update form values by creating a copy and setting the new values object
     *
     * @param name The name of the entry to update values for
     * @param value The new value
     */
    updateValue<EntryName extends keyof FormValues>(
        name: EntryName,
        value: FormValues[EntryName]
    ): void {
        const newValues = cloneDeep(this.values);
        newValues[name] = value;
        this.values = newValues;
    }

    get entryMap(): Map<
        string,
        Entry<FormValues, Extract<keyof FormValues, string>>
    > {
        return this._entries;
    }

    private _entries: Map<
        string,
        Entry<FormValues, Extract<keyof FormValues, string>>
    > = new Map();

    constructor(init: FormInit<FormValues>) {
        this._values = init.values;
        this.title = init.title;
        this.description = init.description;
    }

    param<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        type: string,
        init?: ParameterInit<FormValues, EntryName>
    ): Parameter<FormValues, EntryName> {
        return new Parameter(this, name, type, init);
    }

    getParam<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName
    ): Parameter<FormValues, EntryName> {
        const entry = this.entryMap.get(name);
        if (!(entry instanceof Parameter)) {
            throw new Error(`Entry "${name}" is not a parameter`);
        }
        return entry;
    }

    section<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        init?: SectionInit
    ): Section<FormValues, EntryName> {
        return new Section(this, name, init);
    }

    getSection<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName
    ): Section<FormValues, EntryName> {
        const entry = this.entryMap.get(name);
        if (!(entry instanceof Section)) {
            throw new Error(`Entry "${name}" is not a section`);
        }
        return entry;
    }

    subForm<
        EntryName extends Extract<keyof FormValues, string>,
        SubFormValues extends FormValues[EntryName] & Record<string, unknown>
    >(
        name: EntryName,
        form: Form<SubFormValues>
    ): SubForm<FormValues, EntryName, SubFormValues> {
        return new SubForm(this, name, form);
    }

    getSubForm<
        EntryName extends Extract<keyof FormValues, string>,
        SubFormValues extends FormValues[EntryName] & Record<string, unknown>
    >(name: EntryName): SubForm<FormValues, EntryName, SubFormValues> {
        const entry = this.entryMap.get(name);
        if (!(entry instanceof SubForm)) {
            throw new Error(`Entry "${name}" is not a sub-form`);
        }
        return entry;
    }

    private _emitChangeEvent(newValues: FormValues, oldValues: FormValues) {
        this._emitter.emit("change", newValues, oldValues);
    }

    // KLUDGE: This isn't truly private because it is called by form entries
    _addChild<EntryName extends Extract<keyof FormValues, string>>(
        entry: Entry<FormValues, EntryName>
    ): void {
        if (this._entries.has(entry.name)) {
            throw new Error(
                `An entry named "${entry.name}" already exists in the form`
            );
        }
        this._entries.set(entry.name, entry);
    }
}

export class SubForm<
    ParentFormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof ParentFormValues, string>,
    FormValues extends ParentFormValues[EntryName] & Record<string, unknown>
> implements Entry<ParentFormValues, EntryName>, Form<FormValues>
{
    readonly parentForm: Form<ParentFormValues>;
    name: EntryName;
    form: Form<FormValues>;

    title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
    expanded?: boolean;

    _emitter = new EventEmitter() as TypedEmitter<{
        change: (newValues: FormValues, oldValues: FormValues) => void;
    }>;

    constructor(
        parentForm: Form<ParentFormValues>,
        name: EntryName,
        form: Form<FormValues>,
        init?: SubFormInit
    ) {
        this.parentForm = parentForm;

        this.name = name;
        this.form = form;

        this.title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.inactive = init?.inactive;
        this.errorMessage = init?.errorMessage;
        this.expanded = init?.expanded;

        this.parentForm.values[name] = this.form.values;

        (this.parentForm as FormImpl<ParentFormValues>)._addChild(this);
    }

    get entryMap(): Map<
        string,
        Entry<FormValues, Extract<keyof FormValues, string>>
    > {
        return this.form.entryMap;
    }

    get values(): FormValues {
        return this.form.values;
    }

    set values(newValues: FormValues) {
        this.form.values = newValues;
    }

    /**
     * Update form values by creating a copy and setting the new values object
     *
     * @param name The name of the entry to update values for
     * @param value The new value
     */
    updateValue<EntryName extends keyof FormValues>(
        name: EntryName,
        value: FormValues[EntryName]
    ): void {
        this.form.updateValue(name, value);
    }

    param<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        type: string,
        init?: ParameterInit<FormValues, EntryName>
    ): Parameter<FormValues, EntryName> {
        return this.form.param(name, type, init);
    }

    getParam<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName
    ): Parameter<FormValues, EntryName> {
        return this.form.getParam(name);
    }

    section<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        init?: SectionInit
    ): Section<FormValues, EntryName> {
        return this.form.section(name, init);
    }

    getSection<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName
    ): Section<FormValues, EntryName> {
        return this.form.getSection(name);
    }

    subForm<
        EntryName extends Extract<keyof FormValues, string>,
        SubFormValues extends FormValues[EntryName] & Record<string, unknown>
    >(
        name: EntryName,
        form: Form<SubFormValues>
    ): SubForm<FormValues, EntryName, SubFormValues> {
        return new SubForm(this.form, name, form);
    }

    getSubForm<
        EntryName extends Extract<keyof FormValues, string>,
        SubFormValues extends FormValues[EntryName] & Record<string, unknown>
    >(name: EntryName): SubForm<FormValues, EntryName, SubFormValues> {
        return this.form.getSubForm(name);
    }
}

export class Parameter<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> implements ValuedEntry<FormValues, EntryName>
{
    readonly parentForm: Form<FormValues>;

    name: EntryName;
    type: string;
    title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;

    /**
     * A user-visible bit of text which is shown in place of a value when
     * the value is undefined or null.
     */
    placeholder?: string;

    get value(): FormValues[EntryName] {
        return this.parentForm.values[this.name];
    }

    set value(newValue: FormValues[EntryName]) {
        if (this.parentForm.values[this.name] !== newValue) {
            const oldValue = this.parentForm.values[this.name];
            if (oldValue !== newValue) {
                this.parentForm.updateValue(this.name, newValue);
            }
        }
    }

    constructor(
        parentForm: Form<FormValues>,
        name: EntryName,
        type: string,
        init?: ParameterInit<FormValues, EntryName>
    ) {
        this.parentForm = parentForm;

        this.name = name;
        this.type = type;
        this.title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.inactive = init?.inactive;
        this.errorMessage = init?.errorMessage;

        if (init?.value !== undefined) {
            this.value = init.value;
        }

        (this.parentForm as FormImpl<FormValues>)._addChild(this);
    }
}

export class Section<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> implements ContainerEntry<FormValues, EntryName>
{
    readonly parentForm: Form<FormValues>;

    name: EntryName;
    title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
    inactive?: boolean;
    errorMessage?: string;
    expanded?: boolean;

    constructor(
        parentForm: Form<FormValues>,
        name: EntryName,
        init?: SectionInit
    ) {
        this.parentForm = parentForm;

        this.name = name;
        this.title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.hidden = init?.hidden;
        this.inactive = init?.inactive;
        this.errorMessage = init?.errorMessage;
        this.expanded = init?.expanded;

        (this.parentForm as FormImpl<FormValues>)._addChild(this);
    }

    param<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        type: string,
        init?: ParameterInit<FormValues, EntryName>
    ): Parameter<FormValues, EntryName> {
        return new Parameter(this.parentForm, name, type, init);
    }

    section<EntryName extends Extract<keyof FormValues, string>>(
        name: EntryName,
        init?: SectionInit
    ): Section<FormValues, EntryName> {
        return new Section(this.parentForm, name, init);
    }
}
