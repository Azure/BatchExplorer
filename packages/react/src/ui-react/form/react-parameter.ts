import {
    FormValues,
    Parameter,
    ParameterDependencies,
    ParameterInit,
    ParameterName,
} from "@batch/ui-common/lib/form";
import type { ParamControlProps } from "../components/form";

export interface ReactParameterInit<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
> extends ParameterInit<V, K, D> {
    render?: (props: ParamControlProps<V, K, D>) => JSX.Element;
}

export interface ReactParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
> extends Parameter<V, K, D> {
    render?: (props: ParamControlProps<V, K, D>) => JSX.Element;
}

export function isReactParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V>
>(param: Parameter<V, K, D>): param is ReactParameter<V, K, D> {
    return (param as ReactParameter<V, K, D>).render != null;
}
