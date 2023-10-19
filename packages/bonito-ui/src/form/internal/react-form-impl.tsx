import {
    FormValues,
    ParameterConstructor,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
// eslint-disable-next-line no-restricted-imports
import { FormImpl } from "@azure/bonito-core/lib/form/internal/form-impl";
import { ReactItem, ReactItemInit } from "../react-item";
import { ReactParameter, ReactParameterInit } from "../react-parameter";

/**
 * A form implementation that supports inline React components
 */
export class ReactFormImpl<V extends FormValues> extends FormImpl<V> {
    item(name: string, init?: ReactItemInit<V>): ReactItem<V> {
        return new ReactItem(this, name, init);
    }

    param<
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>,
        VD = undefined
    >(
        name: K,
        parameterConstructor: ParameterConstructor<V, K, D, VD>,
        init?: ReactParameterInit<V, K, D, VD>
    ): ReactParameter<V, K, D, VD> {
        const param = new parameterConstructor(
            this,
            name,
            init
        ) as ReactParameter<V, K, D, VD>;
        if (init?.render) {
            param.render = init.render;
        }
        return param;
    }
}
