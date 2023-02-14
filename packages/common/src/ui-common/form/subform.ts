import EventEmitter from "events";
import TypedEventEmitter from "typed-emitter";
import type {
    DynamicEntryProperties,
    Entry,
    EntryInit,
    ValuedEntry,
    ValuedEntryInit,
} from "./entry";
import type { Form, FormEventMap, FormValues, ValidationOpts } from "./form";
import type { FormImpl } from "./internal/form-impl";
import { Item } from "./item";
import type {
    Parameter,
    ParameterConstructor,
    ParameterDependencies,
    ParameterInit,
    ParameterName,
} from "./parameter";
import type { Section, SectionInit } from "./section";
import { ValidationSnapshot } from "./validation-snapshot";
import type { ValidationStatus } from "./validation-status";

export interface SubFormInit<V extends FormValues, K extends ParameterName<V>>
    extends ValuedEntryInit<V, K> {
    title?: string;
    expanded?: boolean;
}

export interface DynamicSubformProperties<
    V extends FormValues,
    K extends ParameterName<V>
> extends DynamicEntryProperties<V> {
    expanded?: (values: V) => boolean;
    value?: (values: V) => V[K];
}

export class SubForm<
    P extends FormValues,
    PK extends ParameterName<P>,
    S extends P[PK] & FormValues
> implements ValuedEntry<P, PK>, Form<S>
{
    readonly parentForm: Form<P>;
    readonly parentSection?: Section<P>;

    name: PK;
    description?: string;
    dynamic?: DynamicSubformProperties<P, PK>;
    form: Form<S>;

    _emitter = new EventEmitter() as TypedEventEmitter<{
        change: (newValues: S, oldValues: S) => void;
        validate: (snapshot: ValidationSnapshot<S>) => void;
    }>;

    private _dirty?: boolean;
    get dirty(): boolean {
        return this._dirty ?? false;
    }
    set dirty(value: boolean | undefined) {
        this._dirty = value;
    }

    private _disabled?: boolean;
    get disabled(): boolean {
        return this._disabled ?? false;
    }
    set disabled(value: boolean | undefined) {
        this._disabled = value;
    }

    get entryValidationStatus(): {
        [name in ParameterName<S>]?: ValidationStatus;
    } {
        return this.form.entryValidationStatus;
    }

    private _expanded?: boolean;
    get expanded(): boolean {
        return this._expanded ?? false;
    }
    set expanded(value: boolean | undefined) {
        this._expanded = value;
    }

    private _hidden?: boolean;
    get hidden(): boolean {
        return this._hidden ?? false;
    }
    set hidden(value: boolean | undefined) {
        this._hidden = value;
    }

    private _title?: string;
    get title(): string {
        return this._title ?? this.name;
    }
    set title(title: string | undefined) {
        this._title = title;
    }

    get childEntriesCount(): number {
        return this.form.childEntriesCount;
    }

    get allEntriesCount(): number {
        return this.form.allEntriesCount;
    }

    get validationSnapshot(): ValidationSnapshot<S> {
        return this.form.validationSnapshot;
    }

    get validationStatus(): ValidationStatus | undefined {
        return this.form.validationStatus;
    }

    get value(): P[PK] {
        return this.parentForm.values[this.name];
    }
    set value(newValue: P[PK]) {
        this.parentForm.updateValue(this.name, newValue);
    }

    get values(): Readonly<S> {
        return this.form.values;
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
        this.dynamic = init?.dynamic;
        this.hidden = init?.hidden;
        this.expanded = init?.expanded;

        this.parentForm.updateValue(name, this.values as S);

        (this.parentForm as unknown as FormImpl<P>)._registerEntry(this);
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

    item(name: string, init?: EntryInit<S>): Item<S> {
        return this.form.item(name, init);
    }

    param<
        SK extends ParameterName<S>,
        D extends ParameterDependencies<S> = ParameterDependencies<S>,
        T extends Parameter<S, SK, D> = Parameter<S, SK, D>
    >(
        name: SK,
        parameterConstructor: ParameterConstructor<S, SK, D, T>,
        init?: ParameterInit<S, SK, D>
    ): T {
        return this.form.param(name, parameterConstructor, init);
    }

    getParam<SK extends ParameterName<S>>(name: SK): Parameter<S, SK> {
        return this.form.getParam(name);
    }

    section(name: string, init?: SectionInit<S>): Section<S> {
        return this.form.section(name, init);
    }

    getSection(name: string): Section<S> {
        return this.form.getSection(name);
    }

    subForm<SK extends ParameterName<S>, S2 extends S[SK] & FormValues>(
        name: SK,
        form: Form<S2>
    ): SubForm<S, SK, S2> {
        return new SubForm(this.form, name, form);
    }

    getSubForm<SK extends ParameterName<S>, S2 extends S[SK] & FormValues>(
        name: SK
    ): SubForm<S, SK, S2> {
        return this.form.getSubForm(name);
    }

    setValues(values: S): void {
        this.form.setValues(values);
    }

    updateValue<SK extends ParameterName<S>, SV extends S[SK]>(
        name: SK,
        value: SV
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

    on<E extends keyof FormEventMap<S>>(
        event: E,
        handler: FormEventMap<S>[E]
    ): FormEventMap<S>[E] {
        return this.form.on(event, handler);
    }

    off<E extends keyof FormEventMap<S>>(
        event: E,
        handler: FormEventMap<S>[E]
    ): void {
        this.form.off(event, handler);
    }

    evaluate(): boolean {
        return this.form.evaluate();
    }
}
