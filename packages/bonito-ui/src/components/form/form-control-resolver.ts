import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { FormControlProps } from "./form-control";

export interface FormControlOptions<
    V extends FormValues,
    K extends ParameterName<V>
> {
    id?: string;

    /**
     * A callback that expects a React.FormEvent. Specifically used for
     * compatibility with the Azure Portal form builder's change events.
     */
    onChange?: (event: React.FormEvent, value: V[K]) => void;
}

export interface FormControlResolver {
    getFormControl<
        V extends FormValues,
        K extends ParameterName<V>,
        D extends ParameterDependencies<V> = ParameterDependencies<V>
    >(
        props: FormControlProps<V, K, D>
    ): JSX.Element;
}
