import { Form } from "@batch/ui-common";
import { FormValues } from "@batch/ui-common/lib/form";
import { FormButton } from "./form-container";

export type FormLayoutType = "list" | "steps";

export interface FormLayoutProvider {
    getLayout(layout: FormLayoutType): FormLayout;
}

export interface FormLayout {
    render<V extends FormValues>(
        form: Form<V>,
        buttons?: FormButton[]
    ): JSX.Element;
}
