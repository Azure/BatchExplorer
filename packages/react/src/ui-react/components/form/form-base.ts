import {
    FormParameter,
    FormParameterInit,
} from "@batch/ui-common/src/ui-common/form";

/**
 * Shared properties for all form controls
 */
export interface BaseFormControlProps<T> {
    /**
     * The parameter associated with this form control
     */
    parameter?: FormParameter | FormParameterInit;

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
     * If true, the form control will be greyed out and non-interactive.
     */
    disabled?: boolean;

    /**
     * If true, the form control will be visibly hidden
     */
    hidden?: boolean;

    /**
     * While true, the form control's value will be ignored by the form and
     * will not react to changes.
     */
    inactive?: boolean;

    /**
     * The currently displayed error message
     */
    errorMessage?: string;

    /**
     * A user-visible label associated with the form control
     */
    label?: string;

    /**
     * Called to update the state of the control when its associated value has
     * changed.
     */
    onChange?: (value: T) => void;

    /**
     * A user-visible bit of text which is shown in place of a value when
     * the value is undefined or null. Note that not all controls may implement
     * a visible placeholder.
     */
    placeholder?: string;

    /**
     * The current value associated with this control
     */
    value?: T;
}
