import {
    FormValues,
    Parameter,
    ParameterName,
} from "@batch/ui-common/lib/form";

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
    getFormControl<V extends FormValues, K extends ParameterName<V>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions<V, K>
    ): JSX.Element;
}
