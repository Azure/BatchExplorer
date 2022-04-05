import { Form, Parameter, Section } from "@batch/ui-common";
import { Entry, FormValues, SubForm } from "@batch/ui-common/lib/form";
import { Icon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";
import { Stack } from "@fluentui/react/lib/Stack";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import * as React from "react";
import { getBrowserEnvironment } from "../../environment";
import { useUniqueId } from "../../hooks";
import { useAppTheme } from "../../theme";
import { FormButton } from "./form-container";
import { FormLayout } from "./form-layout";

/**
 * Render a form as a flat list.
 */
export class ListFormLayout implements FormLayout {
    render<V extends FormValues>(
        form: Form<V>,
        buttons?: FormButton[]
    ): JSX.Element {
        const rows: JSX.Element[] = [];
        this._renderChildEntries(form.childEntries(), rows);

        return (
            <div style={{ maxWidth: "480px" }}>
                <h2 style={{ marginBottom: "16px" }}>
                    {form.title ?? "Untitled form"}
                </h2>
                <Stack tokens={{ childrenGap: 8 }}>{rows}</Stack>
                <Stack tokens={{ childrenGap: 8 }}>
                    <ButtonContainer buttons={buttons} />
                </Stack>
            </div>
        );
    }

    private _renderChildEntries<V extends FormValues>(
        entries: IterableIterator<Entry<V>>,
        rows: JSX.Element[]
    ) {
        for (const entry of entries) {
            if (entry instanceof Parameter) {
                rows.push(<ParameterRow key={entry.name} param={entry} />);
            } else if (entry instanceof Section) {
                rows.push(<SectionTitle key={entry.name} section={entry} />);
                if (entry.childEntriesCount > 0) {
                    this._renderChildEntries(entry.childEntries(), rows);
                }
            } else if (entry instanceof SubForm) {
                rows.push(<SubFormTitle key={entry.name} subForm={entry} />);
                if (entry.childEntriesCount > 0) {
                    this._renderChildEntries(entry.childEntries(), rows);
                }
            }
        }
    }
}

interface SectionTitleProps<V extends FormValues> {
    section: Section<V>;
}

const SectionTitle = <V extends FormValues>(props: SectionTitleProps<V>) => {
    const { section } = props;
    return <TitleRow title={section.title} description={section.description} />;
};

interface SubFormTitleProps<
    P extends FormValues,
    PK extends Extract<keyof P, string>,
    S extends P[PK] & FormValues
> {
    subForm: SubForm<P, PK, S>;
}

const SubFormTitle = <
    P extends FormValues,
    PK extends Extract<keyof P, string>,
    S extends P[PK] & FormValues
>(
    props: SubFormTitleProps<P, PK, S>
) => {
    const { subForm } = props;
    return <TitleRow title={subForm.title} description={subForm.description} />;
};

const TitleRow = (props: { title: string; description?: string }) => {
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

interface ParameterRowProps<
    V extends FormValues,
    K extends Extract<keyof V, string>
> {
    param: Parameter<V, K>;
}

const ParameterRow = <V extends FormValues, K extends Extract<keyof V, string>>(
    props: ParameterRowProps<V, K>
) => {
    const { param } = props;

    const env = getBrowserEnvironment();
    const toolTipId = useUniqueId("tooltip");
    const formControlId = useUniqueId("form-control");

    return (
        <div>
            <Label htmlFor={formControlId}>
                {param.hideLabel !== true && param.label}
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
            {env.getFormControl(param, { id: formControlId })}
        </div>
    );
};

interface ButtonContainerProps {
    buttons?: FormButton[];
}

const ButtonContainer = (props: ButtonContainerProps) => {
    return (
        <div>
            {props.buttons?.map((btn) => {
                // TODO: Use fluent UI buttons
                return (
                    <button
                        key={btn.label}
                        name={btn.label}
                        aria-label={btn.label}
                        onClick={btn.onClick}
                    ></button>
                );
            })}
        </div>
    );
};
