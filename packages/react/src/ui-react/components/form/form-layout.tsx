import { Form, Parameter } from "@batch/ui-common";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { getBrowserEnvironment } from "../../environment";

export type FormLayoutType = "list";

export interface FormLayoutProvider {
    getLayout(layout: FormLayoutType): FormLayout;
}

export class DefaultFormLayoutProvider implements FormLayoutProvider {
    getLayout(layout: FormLayoutType): FormLayout {
        if (layout === "list") {
            return new ListFormLayout();
        }
        throw new Error(`Invalid form layout type: ${layout}`);
    }
}

export interface FormLayout {
    render<FormValues extends Record<string, unknown>>(
        form: Form<FormValues>
    ): JSX.Element;
}

export class ListFormLayout implements FormLayout {
    render<FormValues extends Record<string, unknown>>(
        form: Form<FormValues>
    ): JSX.Element {
        const env = getBrowserEnvironment();

        const rows: JSX.Element[] = [];
        form.entryMap.forEach((entry) => {
            if (entry instanceof Parameter) {
                rows.push(env.getFormControl(entry));
            }
        });

        return (
            <div style={{ maxWidth: "480px" }}>
                <h2 style={{ marginBottom: "16px" }}>
                    {form.title ?? "Untitled form"}
                </h2>
                <Stack tokens={{ childrenGap: 8 }}>{rows}</Stack>
            </div>
        );
    }
}
