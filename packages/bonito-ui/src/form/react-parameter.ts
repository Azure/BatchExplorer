import {
    FormValues,
    Parameter,
    ParameterDependencies,
    ParameterInit,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import type { FormControlProps } from "../components/form";

export interface ReactParameterInit<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
    VD = undefined
> extends ParameterInit<V, K, D, VD> {
    render?: (props: FormControlProps<V, K, D>) => JSX.Element;
}

export interface ReactParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
    VD = undefined
> extends Parameter<V, K, D, VD> {
    render?: (props: FormControlProps<V, K, D>) => JSX.Element;
}

export function isReactParameter<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V>,
    VD = undefined
>(param: Parameter<V, K, D, VD>): param is ReactParameter<V, K, D, VD> {
    return (param as ReactParameter<V, K, D>).render != null;
}
