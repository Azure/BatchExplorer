import {
    Parameter,
    ParameterDependencies,
    ParameterConstructor,
    ParameterInit,
    ParameterName,
} from "./parameter";
import { OrderedMap } from "../util";
import type { DynamicEntryProperties, Entry, EntryInit } from "./entry";
import type { Form, FormValues } from "./form";
import type { FormImpl } from "./internal/form-impl";
import { SubForm, SubFormInit } from "./subform";
import { Item } from "./item";

export interface SectionInit<V extends FormValues> extends EntryInit<V> {
    title?: string;
    expanded?: boolean;
}

export interface DynamicSectionProperties<V extends FormValues>
    extends DynamicEntryProperties<V> {
    expanded?: (values: V) => boolean;
}

export class Section<V extends FormValues> implements Entry<V> {
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: string;
    description?: string;
    dynamic?: DynamicSectionProperties<V>;

    private _childEntries: OrderedMap<string, Entry<V>> = new OrderedMap();

    get childEntriesCount(): number {
        return this._childEntries.size;
    }

    private _expanded?: boolean;
    get expanded(): boolean {
        return (
            (this.parentSection?.expanded ?? false) || (this._expanded ?? false)
        );
    }
    set expanded(value: boolean | undefined) {
        this._expanded = value;
    }

    private _disabled?: boolean;
    get disabled(): boolean {
        return (
            (this.parentSection?.disabled ?? false) || (this._disabled ?? false)
        );
    }
    set disabled(value: boolean | undefined) {
        this._disabled = value;
    }

    private _hidden?: boolean;
    get hidden(): boolean {
        return (this.parentSection?.hidden ?? false) || (this._hidden ?? false);
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

    constructor(parentForm: Form<V>, name: string, init?: SectionInit<V>) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;
        this._title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.dynamic = init?.dynamic;
        this.hidden = init?.hidden;
        this.expanded = init?.expanded;

        (this.parentForm as unknown as FormImpl<V>)._registerEntry(this);
    }

    childEntries(): IterableIterator<Entry<V>> {
        return this._childEntries.values();
    }

    getEntry(entryName: string): Entry<V> | undefined {
        return this._childEntries.get(entryName);
    }

    item(name: string, init?: EntryInit<V>): Item<V> {
        const entry = new Item(this.parentForm, name, init);
        this._childEntries.set(name, entry);
        return entry;
    }

    param<
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>,
        VD = unknown
    >(
        name: K,
        parameterConstructor: ParameterConstructor<V, K, D, VD>,
        init?: ParameterInit<V, K, D, VD>
    ): Parameter<V, K, D, VD> {
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
