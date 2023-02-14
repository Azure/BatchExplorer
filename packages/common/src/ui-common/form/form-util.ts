import { Form, FormInit, FormValues } from "./form";
import { FormImpl } from "./internal/form-impl";

/**
 * Create a new Form
 *
 * @param initialValues The initial values of the form
 * @returns The newly-created form
 */
export function createForm<V extends FormValues>(init: FormInit<V>): Form<V> {
    return new FormImpl(init);
}

/**
 * Type guard for form objects
 *
 * @param obj The object to check
 * @returns True if the object is a Form, false otherwise
 */
export function isForm<V extends FormValues>(obj: unknown): obj is Form<V> {
    return obj instanceof FormImpl;
}
