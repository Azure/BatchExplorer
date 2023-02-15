import {
    Form,
    Parameter,
    Section,
    AbstractParameter,
    Entry,
    FormValues,
    ParameterName,
    SubForm,
    ValidationSnapshot,
} from "@batch/ui-common/lib/form";
import { Icon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";
import { Stack } from "@fluentui/react/lib/Stack";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import * as React from "react";
import { getBrowserEnvironment } from "../../environment";
import { useUniqueId } from "../../hooks";
import { useForm } from "../../hooks/use-form";
import { useAppTheme } from "../../theme";
import { Button } from "../button";
import { FormButton } from "./form-container";
import { FormLayout, FormLayoutRenderOptions } from "./form-layout";

/**
 * Render a form as a flat list.
 */
export class ListFormLayout implements FormLayout {
    render<V extends FormValues>(
        form: Form<V>,
        opts?: FormLayoutRenderOptions<V>
    ): JSX.Element {
        return (
            <ListForm
                form={form}
                buttons={opts?.buttons}
                onFormChange={opts?.onFormChange}
                onValidate={opts?.onValidate}
            />
        );
    }
}

interface ListFormProps<V extends FormValues> {
    form: Form<V>;
    buttons?: FormButton[];
    onFormChange?: (newValues: V, oldValues: V) => void;
    onValidate?: (snapshot?: ValidationSnapshot<V>) => void;
}

const ListForm = <V extends FormValues>(props: ListFormProps<V>) => {
    const { form, buttons, onFormChange, onValidate } = props;

    const theme = useAppTheme();

    useForm(form, {
        onFormChange: onFormChange,
        onValidate: onValidate,
    });

    const rows: JSX.Element[] = [];
    renderChildEntries(form.childEntries(), rows);

    return (
        <div role="form" style={{ maxWidth: "480px" }}>
            {form.title != null && (
                <h2 style={{ marginBottom: "16px" }}>
                    {form.title ?? "Untitled form"}
                </h2>
            )}
            <Stack tokens={{ childrenGap: 8 }}>
                {rows}
                <ButtonContainer buttons={buttons} />
                <span
                    data-validationlevel={form.validationStatus?.level}
                    style={{
                        color: theme.semanticColors.errorText,
                        visibility:
                            form.validationStatus?.level === "ok" ?? "ok"
                                ? "hidden"
                                : "visible",
                    }}
                >
                    {form.validationStatus?.message}
                </span>
            </Stack>
        </div>
    );
};

function renderChildEntries<V extends FormValues>(
    entries: IterableIterator<Entry<V>>,
    rows: JSX.Element[]
) {
    for (const entry of entries) {
        if (entry instanceof AbstractParameter) {
            rows.push(<ParameterRow key={entry.name} param={entry} />);
        } else if (entry instanceof Section) {
            rows.push(<SectionTitle key={entry.name} section={entry} />);
            if (entry.childEntriesCount > 0) {
                renderChildEntries(entry.childEntries(), rows);
            }
        } else if (entry instanceof SubForm) {
            rows.push(<SubFormTitle key={entry.name} subForm={entry} />);
            if (entry.childEntriesCount > 0) {
                renderChildEntries(entry.childEntries(), rows);
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
    PK extends ParameterName<P>,
    S extends P[PK] & FormValues
> {
    subForm: SubForm<P, PK, S>;
}

const SubFormTitle = <
    P extends FormValues,
    PK extends ParameterName<P>,
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

interface ParameterRowProps<V extends FormValues, K extends ParameterName<V>> {
    param: Parameter<V, K>;
}

const ParameterRow = <V extends FormValues, K extends ParameterName<V>>(
    props: ParameterRowProps<V, K>
) => {
    const { param } = props;

    const env = getBrowserEnvironment();
    const toolTipId = useUniqueId("tooltip");
    const formControlId = useUniqueId("form-control");

    return (
        <div
            style={{
                display: param.hidden === true ? "none" : undefined,
            }}
        >
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
        <div style={{ padding: "16px 0 0 0" }}>
            {props.buttons?.map((btn) => {
                return (
                    <Button
                        key={btn.label}
                        label={btn.label}
                        onClick={btn.onClick}
                        disabled={btn.disabled}
                        primary
                    />
                );
            })}
        </div>
    );
};
