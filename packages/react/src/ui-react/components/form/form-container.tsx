import * as React from "react";
import { Form, FormValues } from "@batch/ui-common/lib/form";
import { getBrowserEnvironment } from "../../environment";
import { FormLayoutType } from "./form-layout";

export interface FormButton {
    label: string;
    onClick?: () => void;
}

export interface FormContainerProps<V extends FormValues> {
    form: Form<V>;
    buttons?: FormButton[];
    layout?: FormLayoutType;
    onFormChange?: (newValues: V, oldValues: V) => void;
}

export const FormContainer = <V extends FormValues>(
    props: FormContainerProps<V>
): JSX.Element => {
    const { form, layout, onFormChange, buttons } = props;

    // KLUDGE: This is really here only to trigger a rerender
    const [, setFormValues] = React.useState(form.values);

    const formChangeHandler = React.useCallback(
        (newValues: V, oldValues: V) => {
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

    return getBrowserEnvironment().getFormLayout(layout).render(form, buttons);
};
