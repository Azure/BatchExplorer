import { Form, Parameter, Section, uniqueId } from "@batch/ui-common";
import { Entry, FormValues, SubForm } from "@batch/ui-common/lib/form";
import { Icon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";
import { Stack } from "@fluentui/react/lib/Stack";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import * as React from "react";
import { getBrowserEnvironment } from "../../environment";
import { useAppTheme } from "../../theme";
import { FormLayout } from "./form-layout";

/**
 * Render forms as a flat list.
 */
export class ListFormLayout implements FormLayout {
    render<V extends FormValues>(form: Form<V>): JSX.Element {
        const rows: JSX.Element[] = [];
        for (const entry of form.allEntries()) {
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

    _renderChildEntries<V extends FormValues>(
        entries: IterableIterator<Entry<V>>,
        rows: JSX.Element[]
    ) {
        for (const entry of entries) {
            if (entry instanceof Parameter) {
                rows.push(<ParameterRow key={entry.name} param={entry} />);
            } else if (entry instanceof Section) {
                rows.push(<SectionTitle key={entry.name} section={entry} />);
            } else if (entry instanceof SubForm) {
                rows.push(<SubFormTitle key={entry.name} subForm={entry} />);
                if (entry.childEntriesCount > 0) {
                    this._renderChildEntries(entry.childEntries(), rows);
                }
            }
        }
    }
}

export interface SectionTitleProps<V extends FormValues> {
    section: Section<V>;
}

export const SectionTitle = <V extends FormValues>(
    props: SectionTitleProps<V>
) => {
    const { section } = props;
    return <TitleRow title={section.title} description={section.description} />;
};

export interface SubFormTitleProps<
    P extends FormValues,
    S extends P[Extract<keyof P, string>] & FormValues
> {
    subForm: SubForm<P, S>;
}

export const SubFormTitle = <
    P extends FormValues,
    S extends P[Extract<keyof P, string>] & FormValues
>(
    props: SubFormTitleProps<P, S>
) => {
    const { subForm } = props;
    return <TitleRow title={subForm.title} description={subForm.description} />;
};

export const TitleRow = (props: { title: string; description?: string }) => {
    const theme = useAppTheme();
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
                {props.title}
            </h3>
            {props.description != null && <span>{props.description}</span>}
        </div>
    );
};

export interface ParameterRowProps<V extends FormValues> {
    param: Parameter<V>;
}

export const ParameterRow = <V extends FormValues>(
    props: ParameterRowProps<V>
) => {
    const { param } = props;

    const env = getBrowserEnvironment();
    const toolTipId = uniqueId("tooltip");

    return (
        <div>
            <Label>
                {param.label}
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
