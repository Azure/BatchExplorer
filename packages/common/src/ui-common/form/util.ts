import type { Form } from "./form";
import type { FormEntry } from "./form-entry";

import { FormEntryType } from "./constants";
import { FormSection } from "./form-section";
import { FormParameter } from "./form-parameter";

/**
 * Searches upwards recursively to find a form entry's direct parent form.
 * Note that this may be a subform and not the root form
 *
 * @param entry The form entry to search for
 * @returns The direct parent form, or null if none is found
 */
export function findParentForm(entry: FormEntry): Form | null {
    if (!entry.parent) {
        return null;
    }
    if (entry.parent.isForm()) {
        return entry.parent;
    } else {
        return findParentForm(entry.parent);
    }
}

export function isFormEntry(object: unknown): object is FormEntry {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = object as any;
    return obj && obj.entryType && typeof obj.id === "string";
}

export function isForm(object: unknown): object is Form {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = object as any;
    return isFormEntry(obj) && obj.entryType === FormEntryType.Form;
}

export function isSection(object: unknown): object is FormSection {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = object as any;
    return isFormEntry(obj) && obj.entryType === FormEntryType.Section;
}

export function isParameter(object: unknown): object is FormParameter {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = object as any;
    return isFormEntry(obj) && obj.entryType === FormEntryType.Parameter;
}
