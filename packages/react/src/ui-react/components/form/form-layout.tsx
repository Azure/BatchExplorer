import { Form, Parameter, Section, uniqueId } from "@batch/ui-common";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { getBrowserEnvironment } from "../../environment";
import { useAppTheme } from "../../theme";
import { Label } from "@fluentui/react/lib/Label";

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

export interface SectionTitleProps<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> {
    section: Section<FormValues, EntryName>;
}

export const SectionTitle = <
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
>(
    props: SectionTitleProps<FormValues, EntryName>
) => {
    const theme = useAppTheme();
    const { section } = props;
    return (
        <div>
            <h3
                style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "4px",
                    paddingBottom: "4px",
                    borderBottom: `1px solid ${theme.palette.neutralTertiary}`,
                }}
            >
                {section.title}
            </h3>
            {section.description != null && <span>{section.description}</span>}
        </div>
    );
};

export interface ParameterRowProps<
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
> {
    param: Parameter<FormValues, EntryName>;
}

export const ParameterRow = <
    FormValues extends Record<string, unknown>,
    EntryName extends Extract<keyof FormValues, string>
>(
    props: ParameterRowProps<FormValues, EntryName>
) => {
    const { param } = props;

    const env = getBrowserEnvironment();
    const toolTipId = uniqueId("tooltip");

    return (
        <div>
            <Label>
                {param.title}
                {param.description != null && (
                    <TooltipHost id={toolTipId} content={param.description}>
                        <Icon
                            aria-describedby={toolTipId}
                            style={{
                                verticalAlign: "middle",
                                marginLeft: ".6em",
                                fontSize: "13px",
                                cursor: "pointer",
                            }}
                            iconName="Info"
                        ></Icon>
                    </TooltipHost>
                )}
            </Label>
            {env.getFormControl(param)}
        </div>
    );
};

export class ListFormLayout implements FormLayout {
    render<FormValues extends Record<string, unknown>>(
        form: Form<FormValues>
    ): JSX.Element {
        const rows: JSX.Element[] = [];
        for (const entry of form.entries()) {
            if (entry instanceof Parameter) {
                rows.push(<ParameterRow key={entry.name} param={entry} />);
            } else if (entry instanceof Section) {
                rows.push(<SectionTitle key={entry.name} section={entry} />);
            }
        }

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
