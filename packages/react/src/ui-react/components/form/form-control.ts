import {
    FormValues,
    Parameter,
    ParameterDependencies,
    ParameterName,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
import { ReactParameter } from "../../form/react-parameter";

/**
 * Shared properties for all form controls
 */
export interface FormControlProps<V> {
    /**
     * The unique HTML ID of the input element
     */
    id?: string;

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
     * CSS styles
     */
    style?: React.CSSProperties;

    /**
     * If true, the form control will be greyed out and non-interactive.
     */
    disabled?: boolean;

    /**
     * If true, the form value has been modified by the user and validation
     * messages should be displayed.
     */
    dirty?: boolean;

    /**
     * If true, the form control will be visibly hidden
     */
    hidden?: boolean;

    /**
     * The currently displayed error message
     */
    validationStatus?: ValidationStatus;

    /**
     * If true, will always display validation errors/warnings
     */
    validationForced?: boolean;

    /**
     * A user-visible label associated with the form control
     */
    label?: string;

    /**
     * Callback for when the value of the control changes
     */
    onChange?: (event: React.FormEvent, value: V) => void;

    /**
     * A user-visible bit of text which is shown in place of a value when
     * the value is undefined or null. Note that not all controls may implement
     * a visible placeholder.
     */
    placeholder?: string;

    /**
     * The current value associated with this control
     */
    value?: V;
}

export interface ParamControlProps<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
    T extends ReactParameter<V, K, D> | Parameter<V, K, D> =
        | ReactParameter<V, K, D>
        | Parameter<V, K, D>
> {
    param: T;
    id?: string;
    onChange?: (event: React.FormEvent, value: V[K]) => void;
}
