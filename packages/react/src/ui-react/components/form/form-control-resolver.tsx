import {
    FormValues,
    Parameter,
    ParameterName,
} from "@batch/ui-common/lib/form";

export interface FormControlOptions {
    id?: string;
}

export interface FormControlResolver {
    getFormControl<V extends FormValues, K extends ParameterName<V>>(
        param: Parameter<V, K>,
        opts?: FormControlOptions
    ): JSX.Element;
}
