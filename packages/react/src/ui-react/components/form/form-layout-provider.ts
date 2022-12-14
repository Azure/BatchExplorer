import { FormValues } from "@batch/ui-common/lib/form";
import React from "react";
import {
    // FormLayout,
    FormLayoutProvider, FormLayoutType, LayoutProps
} from "./form-layout";
// import { ListFormLayout } from "./list-form-layout";

export class DefaultFormLayoutProvider implements FormLayoutProvider {
    getLayout<V extends FormValues>(layout: FormLayoutType): React.FC<LayoutProps<V>> {
        // if (layout === "list") {
        //     return new ListFormLayout();
        // } else if (layout === "steps") {
        //     // TODO: Make a layout where each top-level section is a 'step'
        //     //       in the form.
        //     return new ListFormLayout();
        // }
        // throw new Error(`Invalid form layout type: ${layout}`);
        return null as any;
    }
}
