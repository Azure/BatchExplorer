import type { DynamicEntryProperties, Entry, EntryInit } from "./entry";
import type { Form, FormValues } from "./form";
import type { FormImpl } from "./internal/form-impl";
import { Section } from "./section";

/**
 * A basic form entry which does not contain children or values.
 * Generally used for displaying read-only elements inside the form.
 */
export class Item<V extends FormValues> implements Entry<V> {
    readonly parentForm: Form<V>;
    readonly parentSection?: Section<V>;

    name: string;
    description?: string;
    dynamic?: DynamicEntryProperties<V>;

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

    constructor(parentForm: Form<V>, name: string, init?: EntryInit<V>) {
        this.parentForm = parentForm;
        this.parentSection = init?.parentSection;

        this.name = name;
        this._title = init?.title;
        this.description = init?.description;
        this.disabled = init?.disabled;
        this.dynamic = init?.dynamic;
        this.hidden = init?.hidden;

        (this.parentForm as unknown as FormImpl<V>)._registerEntry(this);
    }
}
