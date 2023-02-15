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
    disabled: boolean;

    /**
     * If true, the associated control will be visibly hidden
     */
    hidden: boolean;

    /**
     * Callbacks to evaluate when the form changes which will dynamically
     * change entry properties
     */
    dynamic?: DynamicEntryProperties<V>;
}

export type DynamicEntryProperties<V extends FormValues> = Partial<{
    [P in keyof Omit<
        Entry<V>,
        "name" | "dynamic" | "parentForm" | "parentSection"
    >]: (values: V) => V[P];
}>;

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
    dynamic?: DynamicEntryProperties<V>;
}

export interface ValuedEntryInit<
    V extends FormValues,
    K extends ParameterName<V>
> extends EntryInit<V> {
    value?: V[K];
}
