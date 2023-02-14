import { Parameter, ParameterInit, ParameterName } from "./parameter";
import { OrderedMap } from "../util";
import type { Entry, EntryInit } from "./entry";
import type { Form, FormValues } from "./form";
import type { FormImpl } from "./internal/form-impl";
import { SubForm, SubFormInit } from "./subform";

export interface SectionInit<V extends FormValues> extends EntryInit<V> {
    title?: string;
    expanded?: boolean;
}

export class Section<V extends FormValues> implements Entry<V> {
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: string;
    _title?: string;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
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
        this.expanded = init?.expanded;

        (this.parentForm as FormImpl<V>)._registerEntry(this);
    }

    childEntries(): IterableIterator<Entry<V>> {
        return this._childEntries.values();
    }

    getEntry(entryName: string): Entry<V> | undefined {
        return this._childEntries.get(entryName);
    }

    param<K extends ParameterName<V>>(
        name: K,
        parameterConstructor: new (
            form: Form<V>,
            name: K,
            init?: ParameterInit<V, K>
        ) => Parameter<V, K>,
        init?: ParameterInit<V, K>
    ): Parameter<V, K> {
        const paramInit = init ?? {};
        paramInit.parentSection = this;

        const param = new parameterConstructor(
            this.parentForm,
            name,
            paramInit
        );
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

    subForm<K extends ParameterName<V>, S extends V[K] & FormValues>(
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
