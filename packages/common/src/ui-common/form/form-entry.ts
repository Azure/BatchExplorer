// Import types only to prevent cyclic dependencies
import type { Form } from "./form";
import type { FormController } from "./form-controller";
import type { FormParameter } from "./form-parameter";
import type { FormSection } from "./form-section";

import { FormEntryType } from "./constants";
import { isForm, isParameter, isSection } from "./util";

let _autoId: number = 0;

/**
 * Represents an object in a form which may be nested inside other form objects.
 * For example: form -> subform -> section -> parameter. Note that the root form
 * object is also an entry, but with no parent.
 */
export interface FormEntry extends FormEntryBase {
    /**
     * An identifier which is unique with respect to the parent form
     */
    readonly id: string;

    /**
     * The fully qualified identifier with respect to the root form. This will
     * only be set once the entry has been added to a form.
     *
     * For example, if a parameter with `id` "myparam" is nested inside of a
     * subform with `id` "mysubform", its `fqId` will be "mysubform.myparam" and
     * its `id` will be "myparam".
     */
    readonly path?: string;

    /**
     * The type of form entry.
     */
    readonly entryType: FormEntryType;

    /**
     * A reference to the root form object
     */
    readonly rootForm: Form;

    /**
     * A reference to the root form's controller object, which handles form
     * state and events for all entries.
     */
    readonly controller: FormController;

    /**
     * Updates this entry's state using its dependencies.
     */
    evaluate(): void;

    /**
     * Initialize this entry. Called when all entries in a form have been added.
     */
    initialize(): void;

    /**
     * Returns true if this entry is a form
     */
    isForm(): this is Form;

    /**
     * Returns true if this entry is a section
     */
    isSection(): this is FormSection;

    /**
     * Returns true if this entry is a parameter
     */
    isParameter(): this is FormParameter;

    /**
     * Internal method used to set the absolute path of an entry
     * when it is added to a form. This method should not be called
     * directly.
     */
    __setPathInternal(path: string): void;
}

/**
 * Constructor initializer for form entries
 */
export interface FormEntryInit extends Partial<FormEntryBase> {
    /**
     * An identifier which is unique with respect to the parent form
     */
    readonly id: string;
}

/**
 * Shared properties between the form entry and its initializer
 */
interface FormEntryBase {
    /**
     * The parent form or section
     */
    parent: FormEntry | null;

    /**
     * A short, user friendly label for this entry
     */
    label?: string;

    /**
     * Descriptive text for this entry
     */
    description?: string;

    /**
     * Controls the order this entry appears in the form. Lower values appear
     * first.
     */
    order?: number;

    /**
     * If true, hides the associated UI component. Unlike the `excluded` state,
     * hidden entry values will still be defined in the parent form's value.
     */
    hidden: boolean;

    /**
     * If true, hides the associated UI component, and additionally sets this
     * entry's value in the root form's value object to be undefined.
     */
    excluded: boolean;

    /**
     * If true, the associated UI component should have user interaction disabled
     */
    disabled: boolean;
}

/**
 * A form entry which has a value (ie: forms, parameters but not sections)
 */
export interface FormEntryWithValue extends FormEntry {
    /**
     * The value associated with this entry
     */
    value?: unknown;
}

/**
 * Constructor initializer for form entries that have values
 */
export interface FormEntryWithValueInit extends FormEntryInit {
    /**
     * The value associated with this entry
     */
    value?: unknown;
}

/**
 * A form entry which can contain other entries (ie: forms/sections but not
 * parameters)
 */
export interface ContainerFormEntry extends FormEntry {
    /**
     * Returns all child entries
     */
    getChildren(): FormEntry[];

    /**
     * Adds a child to this entry, ordered by the entry's `order` property or
     * appended to the end if `order` is undefined. Note that in general
     * using parameter(), section() or subform() is preferred over calling
     * this method directly.
     */
    addChild(entry: FormEntry): void;
}

/**
 * Base class for all form entry objects (forms, sections, parameters)
 *
 * Mutable public properties are implemented as accessors so that other entries
 * in the form can easily react to changes.
 */
export abstract class AbstractFormEntry implements FormEntry {
    readonly id: string;

    get path(): string | undefined {
        return this._path;
    }

    abstract get entryType(): FormEntryType;

    rootForm: Form;

    get controller(): FormController {
        return this.rootForm.controller;
    }

    get parent(): FormEntry | null {
        if (!this.path) {
            return null;
        }
        return this.controller.lookupParent(this.path);
    }

    get label(): string | undefined {
        return this._label;
    }

    set label(value: string | undefined) {
        this._label = value;
    }

    get description(): string | undefined {
        return this._description;
    }

    set description(value: string | undefined) {
        this._description = value;
    }

    get order(): number | undefined {
        return this._order;
    }

    set order(value: number | undefined) {
        this._order = value;
    }

    get hidden(): boolean {
        return this._hidden;
    }

    set hidden(value: boolean) {
        this._hidden = value;
    }

    get excluded(): boolean {
        return this._excluded;
    }

    set excluded(value: boolean) {
        this._excluded = value;
    }

    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = value;
    }

    private _label?: string;
    private _description?: string;
    private _order?: number;
    private _hidden: boolean;
    private _excluded: boolean;
    private _disabled: boolean;

    protected _path?: string;

    constructor(rootForm: Form | "_useThis", init: FormEntryInit) {
        if (rootForm === "_useThis") {
            // KLUDGE: "_useThis" should only be used by root forms
            this.rootForm = (this as unknown) as Form;
        } else {
            this.rootForm = rootForm;
        }

        if (init.id) {
            this.id = init.id;
        } else {
            this.id = `${this._getIdPrefix()}-${_autoId++}`;
        }

        this._label = init.label;
        this._description = init.description;
        this._order = init.order;
        this._hidden = init.hidden ?? false;
        this._excluded = init.excluded ?? false;
        this._disabled = init.disabled ?? false;

        if (this.id.indexOf(".") !== -1) {
            throw new Error("Form entry IDs cannot contain '.' characters");
        }
    }

    protected _getIdPrefix(): FormEntryType {
        return this.entryType ?? "FormEntry";
    }

    abstract initialize(): void;

    abstract evaluate(): void;

    isForm(): this is Form {
        return isForm(this);
    }

    isSection(): this is FormSection {
        return isSection(this);
    }

    isParameter(): this is FormParameter {
        return isParameter(this);
    }

    __setPathInternal(path: string): void {
        if (this._path) {
            throw new Error(
                "Cannot change an entry's path once it has been set"
            );
        }
        this._path = path;
    }
}

/**
 * Base class for all form entry objects which can act as containers
 */
export abstract class AbstractContainerFormEntry
    extends AbstractFormEntry
    implements ContainerFormEntry {
    constructor(rootForm: Form | "_useThis", init: FormEntryInit) {
        super(rootForm, init);
    }

    /**
     * Returns a sorted list of child form entries.
     */
    getChildren(): FormEntry[] {
        if (this.isForm() && !this.isSubForm) {
            return this.controller.lookupChildren("");
        }
        if (!this.path) {
            return [];
        }
        return this.controller.lookupChildren(this.path);
    }

    getParameter(pathOrId: string): FormParameter {
        const child = this.getChild(pathOrId);
        if (child.entryType !== FormEntryType.Parameter) {
            throw new Error(`${child} is not a parameter entry`);
        }
        return child as FormParameter;
    }

    getSection(pathOrId: string): FormSection {
        const child = this.getChild(pathOrId);
        if (child.entryType !== FormEntryType.Section) {
            throw new Error(`${child} is not a section entry`);
        }
        return child as FormSection;
    }

    getSubForm(pathOrId: string): Form {
        const child = this.getChild(pathOrId);
        if (child.entryType !== FormEntryType.Form) {
            throw new Error(`${child} is not a form entry`);
        }
        return child as Form;
    }

    getChild(pathOrId: string): FormEntry {
        let result: FormEntry | null = null;
        if (this.isForm() && !this.isSubForm) {
            result = this.controller.lookup(pathOrId);
        } else if (!this.path) {
            throw new Error(
                "Parent entry has no path. Has it been added to a form?"
            );
        } else {
            result = this.controller.lookupRelative(this.path, pathOrId);
        }

        if (!result) {
            throw new Error(`No child entry with ID "${pathOrId}" found`);
        }
        return result;
    }

    addChild(child: FormEntry): FormEntry {
        if (child.isForm() && !child.isSubForm) {
            throw new Error(
                "Root forms may not be added as children to another form"
            );
        }
        if (child.rootForm !== this.rootForm) {
            throw new Error(
                "Parent and child form entries must share the same root form"
            );
        }
        child.__setPathInternal(this.controller.register(this, child));
        return child;
    }
}
