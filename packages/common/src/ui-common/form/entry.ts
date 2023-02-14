import type { FormValues, Form } from "./form";
import { Section } from "./section";

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
