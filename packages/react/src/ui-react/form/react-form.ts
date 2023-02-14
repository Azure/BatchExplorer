import type {
    Form,
    FormInit,
    FormValues,
    Parameter,
    ParameterConstructor,
    ParameterDependencies,
    ParameterName,
} from "@batch/ui-common/lib/form";
import { ReactFormImpl } from "./internal/react-form-impl";
import { ReactItem, ReactItemInit } from "./react-item";
import type { ReactParameterInit } from "./react-parameter";

export interface ReactForm<V extends FormValues> extends Form<V> {
    item(name: string, init?: ReactItemInit<V>): ReactItem<V>;

    param<
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>,
        T extends Parameter<V, K, D> = Parameter<V, K, D>
    >(
        name: K,
        parameterConstructor: ParameterConstructor<V, K, D, T>,
        init?: ReactParameterInit<V, K, D>
    ): T;
}

/**
 * Create a new React-enabled Form
 *
 * @param initialValues The initial values of the form
 * @returns The newly-created form
 */
export function createReactForm<V extends FormValues>(
    init: FormInit<V>
): ReactForm<V> {
    return new ReactFormImpl(init);
}
