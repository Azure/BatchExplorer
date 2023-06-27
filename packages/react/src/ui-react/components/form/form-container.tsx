import {
    Form,
    FormValues,
    ValidationSnapshot,
} from "@batch/ui-common/lib/form";
import { getBrowserEnvironment } from "../../environment";
import { ButtonProps } from "../button";
import { FormLayoutType } from "./form-layout";

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
    return getBrowserEnvironment().getFormLayout(layout).render(form, {
        buttons: buttons,
        onFormChange: onFormChange,
        onValidate: onValidate,
    });
};
