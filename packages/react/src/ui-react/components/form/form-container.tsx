import * as React from "react";
import { Form } from "@batch/ui-common/lib/form";
import { getBrowserEnvironment } from "../../environment";

export interface FormContainerProps<
    FormValues extends Record<string, unknown>
> {
    form: Form<FormValues>;
    onFormChange?: (newValues: FormValues, oldValues: FormValues) => void;
}

export const FormContainer = <FormValues extends Record<string, unknown>>(
    props: FormContainerProps<FormValues>
) => {
    const { form, onFormChange } = props;

    // KLUDGE: This is really here only to trigger a re-render
    const [, setFormValues] = React.useState(form.values);

    const formChangeHandler = React.useCallback(
        (newValues: FormValues, oldValues: FormValues) => {
            setFormValues(newValues);
            if (onFormChange) {
                onFormChange(newValues, oldValues);
            }
        },
        [onFormChange]
    );

    React.useEffect(() => {
        form._emitter.on("change", formChangeHandler);
        return () => {
            form._emitter.off("change", formChangeHandler);
        };
    }, [form, formChangeHandler]);

    return getBrowserEnvironment().getFormLayout().render(form);
};
