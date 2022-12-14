import * as React from "react";
import {
    Form,
    FormValues,
    ValidationSnapshot,
    ValidationStatus,
} from "@batch/ui-common/lib/form";
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
    onValidationStatusChange?: (
        oldStatus: ValidationStatus | undefined,
        newStatus: ValidationStatus | undefined
    ) => void;
}

export const FormContainer = <V extends FormValues>(
    props: FormContainerProps<V>
): JSX.Element => {
    const { form, layout, onFormChange, buttons } = props;

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
        },
        []
    );

    React.useEffect(() => {
        form._emitter.on("validate", formValidateHandler);
        return () => {
            form._emitter.off("validate", formValidateHandler);
        };
    }, [form, formValidateHandler]);

    const LayoutComp = getBrowserEnvironment().getFormLayout<V>(layout);

    return <LayoutComp form={form} button={buttons} />;

    // getBrowserEnvironment().getFormLayout(layout).render(form, buttons);
};
