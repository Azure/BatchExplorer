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

        /**
         * Callback for whenever the form.evaluate() is called
         * @param propsChanged True if the props have changed during evaluation
         */
        onEvaluate?: (propsChanged?: boolean) => void;
    } = {}
) {
    const { onFormChange, onValidate, onEvaluate } = opts;

    const [values, setValues] = useState<V>(form.values);
    const [validationSnapshot, setValidationSnapshot] = useState<
        ValidationSnapshot<V> | undefined
    >();

    // Change events
    useEffect(() => {
        // Evaluate one time before hooking up change handler
        form.evaluate();

        const changeHandler = form.on("change", (newValues, oldValues) => {
            setValues(newValues);
            if (onFormChange) {
                onFormChange(newValues, oldValues);
            }
            form.validate();
        });

        const validationHandler = form.on("validate", (snapshot) => {
            setValidationSnapshot(snapshot);
            if (onValidate) {
                onValidate(snapshot);
            }
        });

        const evaluateHandler = form.on("evaluate", (propsChanged) => {
            if (onEvaluate) {
                onEvaluate(propsChanged);
            }
        });

        return () => {
            form.off("change", changeHandler);
            form.off("validate", validationHandler);
            form.off("evaluate", evaluateHandler);
        };
    }, [form, onFormChange, onValidate, onEvaluate]);

    return {
        validationSnapshot,
        values,
    };
}
