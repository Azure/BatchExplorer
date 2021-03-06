/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Form } from "./form";

import { FormEntryType, FormParameterType } from "./constants";
import {
    AbstractFormEntry,
    FormEntryWithValue,
    FormEntryWithValueInit,
} from "./form-entry";

/**
 * Constructor initializer for parameters
 */
export interface FormParameterInit extends FormEntryWithValueInit {
    type?: FormParameterType;
}

/**
 * A form entry which represents a single key/value pair and must be contained
 * by a form or section
 */
export class FormParameter
    extends AbstractFormEntry
    implements FormEntryWithValue
{
    private readonly _type: FormParameterType;
    private _initialValue?: any;

    get entryType(): FormEntryType {
        return FormEntryType.Parameter;
    }

    get type(): FormParameterType {
        return this._type;
    }

    get value(): unknown {
        if (this.path) {
            return this.controller.getValue(this.path);
        }
        return this._initialValue;
    }

    set value(value: unknown) {
        if (!this.path) {
            // Form is uninitialized - just store the value
            // as the initial value of the parameter
            this._initialValue = value;
        } else {
            this._updateControllerValue(value);
        }
    }

    /**
     * Gets the value of this parameter before the form was initialized
     */
    get initialValue(): any {
        return this._initialValue;
    }

    constructor(rootForm: Form, init: FormParameterInit) {
        super(rootForm, init);
        this._type = init.type ?? FormParameterType.Auto;
        this._initialValue = init.value;

        if (init.parent?.entryType === FormEntryType.Parameter) {
            throw new Error("Form parameters cannot be nested");
        }
    }

    initialize(): void {
        this._updateControllerValue(this._initialValue);
    }

    evaluate(): void {
        // TODO: Implement this
    }

    private _updateControllerValue(value: any) {
        if (!this.path) {
            throw new Error(
                "Cannot update parameter values until the parameter has been added to a form"
            );
        }
        this.rootForm.controller.updateValue(this.path, value);
    }
}
