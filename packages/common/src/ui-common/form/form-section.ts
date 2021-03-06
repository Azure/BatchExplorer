import { FormEntryType } from "./constants";
import type { Form } from "./form";

import { AbstractContainerFormEntry, FormEntryInit } from "./form-entry";

export type FormSectionInit = FormEntryInit;

/**
 * A form entry which acts as a container for other entries, but
 * does not contain a value of its own.
 */
export class FormSection extends AbstractContainerFormEntry {
    get entryType(): FormEntryType {
        return FormEntryType.Section;
    }

    constructor(rootForm: Form, init: FormSectionInit) {
        super(rootForm, init);
    }

    initialize(): void {
        // No-op
    }

    evaluate(): void {
        // TODO: Implement this
    }
}
