import {
    FormValues,
    Parameter,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { ReactParameter } from "../../form";

/**
 * Shared properties for all form controls
 */
export interface FormControlProps<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
    T extends ReactParameter<V, K, D> | Parameter<V, K, D> =
        | ReactParameter<V, K, D>
        | Parameter<V, K, D>
> {
    /**
     * The unique HTML ID of the input element
     */
    id?: string;

    /**
     * The form parameter associated with this control
     */
    param: T;

    /**
     * The accessible label for the form control. Only needed if the accessible
     * label should be different from the visible label
     */
    ariaLabel?: string;

    /**
     * CSS class name
     */
    className?: string;

    /**
     * Disable the control. Should take precedence over the parameter
     * disabled property. This can be useful for preventing user interaction
     * during loading regardless of the parameter's disabled state.
     */
    disabled?: boolean;

    /**
     * CSS styles
     */
    style?: React.CSSProperties;

    /**
     * Callback for when the control is focused
     */
    onFocus?: (event: React.FocusEvent) => void;

    /**
     * Callback for when the control is unfocused
     */
    onBlur?: (event: React.FocusEvent) => void;

    /**
     * Callback for when the value of the control changes
     */
    onChange?: (event: React.FormEvent | null, value: V[K]) => void;
}
