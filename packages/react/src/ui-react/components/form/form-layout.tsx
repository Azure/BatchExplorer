import { Form } from "@batch/ui-common";
import { FormValues } from "@batch/ui-common/lib/form";
import { FormButton } from "./form-container";

export type FormLayoutType = "list" | "steps";

export interface FormLayoutProvider {
    getLayout<V extends FormValues>(
        layout: FormLayoutType
    ): React.FC<LayoutProps<V>>;
}

export interface LayoutProps<V extends FormValues> {
    form: Form<V>;
    button?: FormButton[];
}

export interface FormLayout {
    render<V extends FormValues>(
        form: Form<V>,
        buttons?: FormButton[]
    ): JSX.Element;
}
