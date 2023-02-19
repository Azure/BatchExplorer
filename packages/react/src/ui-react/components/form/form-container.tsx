import * as React from "react";
import {
    Form,
    FormValues,
    ValidationSnapshot,
} from "@batch/ui-common/lib/form";
import { getBrowserEnvironment } from "../../environment";
import { FormLayoutType } from "./form-layout";
import { ButtonProps } from "../button";

export interface FormButton extends ButtonProps {
    submitForm?: boolean;
}

export interface FormContainerProps<V extends FormValues> {
    form: Form<V>;
    buttons?: FormButton[];
    layout?: FormLayoutType;
    onFormChange?: (newValues: V, oldValues: V) => void;
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
}

export const FormContainer = <V extends FormValues>(
    props: FormContainerProps<V>
): JSX.Element => {
    const { form, layout, onFormChange, onValidate, buttons } = props;

    // KLUDGE: These exist simply to trigger a rerender. The data is not
    //         actually used, as the components read the form directly
    const [, setFormValues] = React.useState(form.values);
    const [, setValidationStatus] = React.useState(form.validationStatus);

    const formChangeHandler = React.useCallback(
        (newValues: V, oldValues: V) => {
            setFormValues(newValues);
            if (onFormChange) {
                onFormChange(newValues, oldValues);
            }
            form.validate();
        },
        [form, onFormChange]
    );

    React.useEffect(() => {
        form._emitter.on("change", formChangeHandler);
        return () => {
            form._emitter.off("change", formChangeHandler);
        };
    }, [form, formChangeHandler]);

    const formValidateHandler = React.useCallback(
        async (snapshot?: ValidationSnapshot<V>) => {
            // Note this will set the validation status to undefined
            // when a validation event is seen without a snapshot, indicating a
            // new validation round has begun, and any previous displayed
            // validation data should be cleared.
            setValidationStatus(snapshot?.overallStatus);
            if (onValidate) {
                onValidate(snapshot);
            }
        },
        [onValidate]
    );

    React.useEffect(() => {
        form._emitter.on("validate", formValidateHandler);
        return () => {
            form._emitter.off("validate", formValidateHandler);
        };
    }, [form, formValidateHandler]);

    return getBrowserEnvironment().getFormLayout(layout).render(form, buttons);
};
