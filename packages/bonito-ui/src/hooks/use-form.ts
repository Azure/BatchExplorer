import {
    Form,
    FormValues,
    ValidationSnapshot,
} from "@azure/bonito-core/lib/form";
import { useEffect, useState } from "react";

/**
 * Hook for reacting to state changes for a given form. Returns
 * various state variables useful for rendering. Also performs validation
 * and dynamic evaluation on changes.
 *
 * @param form The form to use
 * @param opts Various options such as callbacks for reacting to changes, etc.
 *
 * @returns A set of state variables that can be used in form controls.
 */
export function useForm<V extends FormValues, DataResult = never>(
    form: Form<V>,
    opts: {
        /**
         * Callback for whenever the form values change
         *
         * @param newValues The newest values
         * @param oldValues The previous values
         */
        onFormChange?: (newValues: V, oldValues: V) => void;

        /**
         * Callback for whenever the form is validated
         *
         * @param snapshot The latest validation snapshot
         */
        onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
    } = {}
) {
    const { onFormChange, onValidate } = opts;

    const [values, setValues] = useState<V>(form.values);
    const [validationSnapshot, setValidationSnapshot] = useState<
        ValidationSnapshot<V> | undefined
    >();

    // Change events
    useEffect(() => {
        // Evaluate one time before hooking up change handler
        form.evaluate();

        const changeHandler = form.on("change", (newValues, oldValues) => {
            const changed = form.evaluate();
            // Don't do anything if evaluating the form resulted in
            // changes, since another change event will be fired
            if (!changed) {
                setValues(newValues);
                if (onFormChange) {
                    onFormChange(newValues, oldValues);
                }
                form.validate();
            }
        });

        const validationHandler = form.on("validate", (snapshot) => {
            setValidationSnapshot(snapshot);
            if (onValidate) {
                onValidate(snapshot);
            }
        });

        return () => {
            form.off("change", changeHandler);
            form.off("validate", validationHandler);
        };
    }, [form, onFormChange, onValidate]);

    return {
        validationSnapshot,
        values,
    };
}
