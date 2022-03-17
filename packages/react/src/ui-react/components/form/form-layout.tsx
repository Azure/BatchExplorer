import { Form } from "@batch/ui-common";
import { FormValues } from "@batch/ui-common/lib/form";

export type FormLayoutType = "list";

export interface FormLayoutProvider {
    getLayout(layout: FormLayoutType): FormLayout;
}

export interface FormLayout {
    render<V extends FormValues>(form: Form<V>): JSX.Element;
}
