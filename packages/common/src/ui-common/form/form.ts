import { cloneDeep } from "../util";
import { FormEntryType } from "./constants";
import { FormController } from "./form-controller";
import {
    AbstractContainerFormEntry,
    FormEntryWithValue,
    FormEntryWithValueInit,
} from "./form-entry";
import { isForm } from "./util";

export type FormInit = FormEntryWithValueInit;

/**
 * A form which may contain child entries, and may be nested inside an entry itself
 * A form's value is an object with key/value pairs representing parameter names
 * and values or subform names and values
 */
export class Form
    extends AbstractContainerFormEntry
    implements FormEntryWithValue
{
    isSubForm: boolean;

    private _controller: FormController;

    get controller(): FormController {
        return this._controller;
    }

    get entryType(): FormEntryType {
        return FormEntryType.Form;
    }

    get value(): Record<string, unknown> {
        if (this.parent) {
            throw new Error("Getting values on subforms is not supported");
        }
        return this.controller.getValue("");
    }

    set value(value: Record<string, unknown>) {
        if (this.parent) {
            throw new Error("Setting values on subforms is not supported");
        }
        this.controller.updateValue("", value);
    }

    constructor(rootForm: Form, init: FormInit);
    constructor(init: FormInit);
    constructor(formOrInit: Form | FormInit, initOrUndefined?: FormInit) {
        let init: FormInit;
        if (isForm(formOrInit) && initOrUndefined) {
            super(formOrInit, initOrUndefined);
            init = initOrUndefined;
        } else {
            super("_useThis", formOrInit);
            init = formOrInit;
        }

        if (this.rootForm === this) {
            this.isSubForm = false;
        } else {
            this.isSubForm = true;
        }

        if (this.isSubForm) {
            this._controller = this.rootForm.controller;
        } else {
            // Only root forms create a form controller. All
            // other entries reference the root form's controller.
            this._controller = new FormController(this);
        }

        this._controller.updateValue("", init.value ?? {});
    }

    initialize(): void {
        if (!this.isSubForm) {
            this._controller.initializeEntries();
        }
    }

    evaluate(): void {
        if (!this.path) {
            console.error("Cannot evaluate an uninitialized form");
            return;
        }
        // Clone instead of modifying value in place
        const value = cloneDeep(this.controller.getValue(this.path));

        // Update values
        const children = this.getChildren();
        for (const child of children) {
            // Evaluate first to make sure values are up to date
            child.evaluate();

            // Update this form's values
            if (child.isParameter() || child.isForm()) {
                if (child.value === null) {
                    value[child.id] = null;
                } else if (child.value === undefined) {
                    value[child.id] = undefined;
                } else {
                    value[child.id] = cloneDeep(child.value);
                }
            }
        }

        // Replace value with updated copy
        this.value = value;
    }

    __setPathInternal(path: string): void {
        if (!this.isSubForm) {
            throw new Error("Cannot set the path of the root form");
        }
        super.__setPathInternal(path);
    }
}
