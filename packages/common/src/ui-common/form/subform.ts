import EventEmitter from "events";
import TypedEventEmitter from "typed-emitter";
import type { Entry, ValuedEntry, ValuedEntryInit } from "./entry";
import type { Form, FormEventMap, FormValues, ValidationOpts } from "./form";
import type { FormImpl } from "./internal/form-impl";
import type { Parameter, ParameterInit, ParameterName } from "./parameter";
import type { Section, SectionInit } from "./section";
import { ValidationSnapshot } from "./validation-snapshot";
import type { ValidationStatus } from "./validation-status";

export interface SubFormInit<V extends FormValues, K extends ParameterName<V>>
    extends ValuedEntryInit<V, K> {
    title?: string;
    expanded?: boolean;
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
    form: Form<S>;

    _title?: string;
    description?: string;
    dirty?: boolean;
    disabled?: boolean;
    hidden?: boolean;
    expanded?: boolean;

    _emitter = new EventEmitter() as TypedEventEmitter<{
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
        [name in ParameterName<S>]?: ValidationStatus;
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
        this.hidden = init?.hidden;
        this.expanded = init?.expanded;

        this.parentForm.updateValue(name, this.values as S);

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

    param<SK extends ParameterName<S>>(
        name: SK,
        parameterConstructor: new (
            form: Form<S>,
            name: SK,
            init?: ParameterInit<S, SK>
        ) => Parameter<S, SK>,
        init?: ParameterInit<S, SK>
    ): Parameter<S, SK> {
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
}
