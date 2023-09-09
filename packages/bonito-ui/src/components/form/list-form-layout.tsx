import {
    AbstractParameter,
    Entry,
    Form,
    FormValues,
    Parameter,
    ParameterName,
    Section,
    SubForm,
    ValidationSnapshot,
} from "@azure/bonito-core/lib/form";
import { Icon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";
import { Stack } from "@fluentui/react/lib/Stack";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import * as React from "react";
import { getBrowserEnvironment } from "../../environment";
import { ReactItem } from "../../form/react-item";
import { useUniqueId } from "../../hooks";
import { useForm } from "../../hooks/use-form";
import { useAppTheme } from "../../theme";
import { Button } from "../button";
import { FormButton } from "./form-container";
import { FormLayout, FormLayoutRenderOptions } from "./form-layout";
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar";

// Enable to show debug info
const DEBUG_MODE = false;

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

    useForm(form, {
        onFormChange: onFormChange,
        onValidate: onValidate,
    });

    const rows: JSX.Element[] = [];
    renderChildEntries(form.childEntries(), rows);

    let messageBarType: MessageBarType | undefined;
    if (form.validationStatus?.level === "warn") {
        messageBarType = MessageBarType.warning;
    } else if (form.validationStatus?.level === "error") {
        messageBarType = MessageBarType.error;
    }

    return (
        <div role="form" className="form-root">
            {form.title != null && (
                <h2 style={{ marginBottom: "16px" }}>
                    {form.title ?? "Untitled form"}
                </h2>
            )}
            <Stack tokens={{ childrenGap: 8 }}>
                <Stack
                    className="form-row-container"
                    tokens={{ childrenGap: 8 }}
                >
                    {rows}
                </Stack>

                {messageBarType && (
                    <div
                        data-testid="form-validation-message"
                        style={{ paddingTop: 8 }}
                    >
                        <MessageBar messageBarType={messageBarType}>
                            {form.validationStatus?.message}
                        </MessageBar>
                    </div>
                )}

                <ButtonContainer buttons={buttons} />
            </Stack>
        </div>
    );
};

function renderChildEntries<V extends FormValues>(
    entries: IterableIterator<Entry<V>>,
    rows: JSX.Element[],
    parentKey: string = ""
) {
    for (const entry of entries) {
        const key = `${parentKey}.${entry.name}`;
        if (entry instanceof AbstractParameter) {
            rows.push(<ParameterRow key={key} param={entry} />);
        } else if (entry instanceof ReactItem) {
            rows.push(<ItemRow key={key} item={entry} />);
        } else if (entry instanceof Section) {
            rows.push(<SectionTitle key={key} section={entry} />);
            if (entry.childEntriesCount > 0) {
                renderChildEntries(entry.childEntries(), rows, key);
            }
        } else if (entry instanceof SubForm) {
            rows.push(<SubFormTitle key={key} subForm={entry} />);
            if (entry.childEntriesCount > 0) {
                renderChildEntries(entry.childEntries(), rows, key);
            }
        }
    }
}

interface ItemRowProps<V extends FormValues> {
    item: ReactItem<V>;
}

const ItemRow = <V extends FormValues>(props: ItemRowProps<V>) => {
    const { item } = props;
    if (!item.render) {
        return <></>;
    }
    return (
        <div
            className="form-item-row"
            style={{
                display: item.hidden === true ? "none" : undefined,
            }}
        >
            {item.render({ item: item, values: item.parentForm.values })}
        </div>
    );
};

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
        <div className="form-title-row">
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
            className="form-parameter-row"
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
            {env.getFormControl({ param, id: formControlId })}
            {DEBUG_MODE && <EntryDebugInfo entry={param} />}
        </div>
    );
};

interface ButtonContainerProps {
    buttons?: FormButton[];
}

const ButtonContainer = (props: ButtonContainerProps) => {
    return (
        <Stack
            style={{ paddingTop: 8 }}
            className="form-button-container"
            horizontal={true}
            tokens={{ childrenGap: "8px" }}
        >
            {props.buttons?.map((btn) => {
                return (
                    <Button
                        key={btn.label}
                        label={btn.label}
                        onClick={btn.onClick}
                        disabled={btn.disabled}
                        primary={btn.primary}
                    />
                );
            })}
        </Stack>
    );
};

export const EntryDebugInfo = <
    V extends FormValues,
    K extends ParameterName<V>
>(props: {
    entry: Parameter<V, K>;
}) => {
    const { entry } = props;
    const pairs: [string, string][] = [];
    if (entry instanceof AbstractParameter) {
        pairs.push([entry.name, entry.value ?? ""]);

        const validationMsg = entry.validationStatus?.message ?? "";
        pairs.push([
            `${entry.validationStatus?.level ?? "Not validated"}${
                entry.validationStatus?.forced === true ? " [Force]" : ""
            }`,
            validationMsg,
        ]);
    }

    const rows: JSX.Element[] = [];
    for (const p of pairs) {
        rows.push(
            <Stack horizontal={true} tokens={{ childrenGap: "4px" }}>
                <span>{p[0]}</span>
                <span>{p[1]}</span>
            </Stack>
        );
    }

    return <Stack>{rows}</Stack>;
};
