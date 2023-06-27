import {
    Form,
    FormValues,
    ValidationSnapshot,
} from "@batch/ui-common/lib/form";
import { FormButton } from "./form-container";

export type FormLayoutType = "list" | "steps";

export interface FormLayoutProvider {
    getLayout(layout: FormLayoutType): FormLayout;
}

export type FormLayoutRenderOptions<V extends FormValues> = {
    buttons?: FormButton[];
    onFormChange?: (newValues: V, oldValues: V) => void;
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
};

export interface FormLayout {
    render<V extends FormValues>(
        form: Form<V>,
        opts?: FormLayoutRenderOptions<V>
    ): JSX.Element;
}
