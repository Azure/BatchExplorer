import type { FormValues, Form } from "./form";
import type { ParameterName } from "./parameter";
import type { Section } from "./section";

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
}

export interface ValuedEntry<V extends FormValues, K extends ParameterName<V>>
    extends Entry<V> {
    name: K;
    value?: V[K];
}

export interface EntryInit<V extends FormValues> {
    parentSection?: Section<V>;
    description?: string;
    disabled?: boolean;
    hidden?: boolean;
}

export interface ValuedEntryInit<
    V extends FormValues,
    K extends ParameterName<V>
> extends EntryInit<V> {
    value?: V[K];
}
