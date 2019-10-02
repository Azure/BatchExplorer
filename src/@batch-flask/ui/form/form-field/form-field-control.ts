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

    /** Whether the control is required. */
    public readonly required: boolean;

    /** Whether the control is disabled. */
    public readonly disabled: boolean;

    /** Sets the list of element IDs that currently describe this control. */
    public abstract setDescribedByIds(ids: string[]): void;

    /** Handles a click on the control's container. */
    public abstract onContainerClick(event: MouseEvent): void;
}
