import { EntryInit, Form, FormValues, Item } from "@azure/bonito-core/lib/form";

export interface ReactItemProps<V extends FormValues> {
    item: Item<V>;
    values: V;
}

export interface ReactItemInit<V extends FormValues> extends EntryInit<V> {
    render?: (props: ReactItemProps<V>) => JSX.Element;
}

export class ReactItem<V extends FormValues> extends Item<V> {
    render?: (props: ReactItemProps<V>) => JSX.Element;

    constructor(parentForm: Form<V>, name: string, init?: ReactItemInit<V>) {
        super(parentForm, name, init);
        this.render = init?.render;
    }
}

export function isReactItem<V extends FormValues>(
    item: Item<V>
): item is ReactItem<V> {
    return (item as ReactItem<V>).render != null;
}
