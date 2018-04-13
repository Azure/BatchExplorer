import { NgControl } from "@angular/forms";
import { Observable } from "rxjs";

/** An interface which allows a control to work inside of a `MatFormField`. */
export abstract class FormFieldControl<T> {
    /** The value of the control. */
    public value: T | null;

    /**
     * Stream that emits whenever the state of the control changes such that the parent `MatFormField`
     * needs to run change detection.
     */
    public readonly stateChanges: Observable<void>;

    /**
     * Id to be used for this control. This is needed to attach the label(for)
     */
    public readonly id: string;

    /**
     * Placeholder. This will be the label content
     */
    public readonly placeholder: string;

    /** Gets the NgControl for this control. */
    public readonly ngControl: NgControl | null;

    /** Whether the control is focused. */
    public readonly focused: boolean;

    /** Whether the control is empty. */
    public readonly empty: boolean;

    /** Whether the control is required. */
    public readonly required: boolean;

    /** Whether the control is disabled. */
    public readonly disabled: boolean;

    /**
     * An optional name for the control type that can be used to distinguish `mat-form-field` elements
     * based on their control type. The form field will add a class,
     * `mat-form-field-type-{{controlType}}` to its root element.
     */
    public readonly controlType?: string;

    /**
     * Whether the input is currently in an autofilled state. If property is not present on the
     * control it is assumed to be false.
     */
    public readonly autofilled?: boolean;

    /** Sets the list of element IDs that currently describe this control. */
    public abstract setDescribedByIds(ids: string[]): void;

    /** Handles a click on the control's container. */
    public abstract onContainerClick(event: MouseEvent): void;
}
