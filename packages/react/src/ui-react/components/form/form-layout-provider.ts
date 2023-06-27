import { FormLayout, FormLayoutProvider, FormLayoutType } from "./form-layout";
import { ListFormLayout } from "./list-form-layout";

export class DefaultFormLayoutProvider implements FormLayoutProvider {
    getLayout(layout: FormLayoutType): FormLayout {
        if (layout === "list") {
            return new ListFormLayout();
        } else if (layout === "steps") {
            // TODO: Make a layout where each top-level section is a 'step'
            //       in the form.
            return new ListFormLayout();
        }
        throw new Error(`Invalid form layout type: ${layout}`);
    }
}
