import type {
    Form,
    FormInit,
    FormValues,
    Parameter,
    ParameterConstructor,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
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

interface StandaloneForm<S> extends FormValues {
    _standaloneParam?: S;
}

/**
 * Creates a standalone parameter with a backing form. Useful for using
 * form controls outside the context of an entire form
 */
export function createParam<
    S,
    D extends ParameterDependencies<StandaloneForm<S>> = ParameterDependencies<
        StandaloneForm<S>
    >,
    T extends Parameter<StandaloneForm<S>, "_standaloneParam", D> = Parameter<
        StandaloneForm<S>,
        "_standaloneParam",
        D
    >
>(
    parameterConstructor: ParameterConstructor<
        StandaloneForm<S>,
        "_standaloneParam",
        D,
        T
    >,
    init?: ReactParameterInit<StandaloneForm<S>, "_standaloneParam", D>
) {
    init = init ?? {};
    init.standalone = true;

    const form = createReactForm<StandaloneForm<S>>({
        values: {
            _standaloneParam: init?.value,
        },
    });
    return form.param("_standaloneParam", parameterConstructor, init);
}
