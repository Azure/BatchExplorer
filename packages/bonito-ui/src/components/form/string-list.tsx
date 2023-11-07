import { FormValues, ParameterName } from "@azure/bonito-core/lib/form";
import { IconButton } from "@fluentui/react/lib/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";
import { useAppTheme } from "../../theme";
import { translate } from "@azure/bonito-core";

export interface StringListValidationDetails {
    [key: number]: string;
}

export function StringList<V extends FormValues, K extends ParameterName<V>>(
    props: FormControlProps<V, K>
): JSX.Element {
    const { className, style, param, onChange } = props;

    const id = useUniqueId("form-control", props.id);
    const validationDetails = useFormParameter(param)
        .validationDetails as StringListValidationDetails;

    const items = useMemo<string[]>(() => {
        const items: string[] = [];
        if (param.value && Array.isArray(param.value)) {
            for (const item of param.value) {
                items.push(item);
            }
        }
        // Add an empty item at the end
        items.push("");
        return items;
    }, [param.value]);

    const onItemChange = useCallback(
        (index: number, value: string) => {
            const newItems = [...items];
            if (index === items.length - 1) {
                // Last item, add a new one
                newItems.push("");
            }
            newItems[index] = value;
            param.value = newItems.slice(0, newItems.length - 1) as V[K];
            onChange?.(null, param.value);
        },
        [items, param, onChange]
    );

    const onItemDelete = useCallback(
        (index: number) => {
            const newItems = [...items];
            newItems.splice(index, 1);
            param.value = newItems.slice(0, newItems.length - 1) as V[K];
            onChange?.(null, param.value);
        },
        [items, param, onChange]
    );

    return (
        <Stack key={id} style={style} className={className}>
            {items.map((item, index) => {
                const errorMsg = validationDetails?.[index];
                return (
                    <StringListItem
                        key={index}
                        index={index}
                        value={item}
                        label={param.label}
                        errorMsg={errorMsg}
                        placeholder={param.placeholder}
                        onChange={onItemChange}
                        onDelete={onItemDelete}
                        disableDelete={index === items.length - 1}
                    ></StringListItem>
                );
            })}
        </Stack>
    );
}

interface StringListItemProps {
    index: number;
    value: string;
    label?: string;
    onChange: (index: number, value: string) => void;
    onDelete: (index: number) => void;
    placeholder?: string;
    disableDelete?: boolean;
    errorMsg?: string;
}

function StringListItem(props: StringListItemProps) {
    const {
        index,
        value,
        label,
        onChange,
        onDelete,
        disableDelete,
        errorMsg,
        placeholder,
    } = props;
    const styles = useStringListItemStyles(props);
    const ariaLabel = `${label || ""} ${index + 1}`;
    return (
        <Stack
            key={index}
            horizontal
            verticalAlign="center"
            styles={styles.container}
        >
            <Stack.Item grow={1}>
                <TextField
                    styles={styles.input}
                    value={value}
                    ariaLabel={ariaLabel}
                    placeholder={placeholder}
                    errorMessage={errorMsg}
                    onChange={(_, newValue) => {
                        onChange(index, newValue || "");
                    }}
                />
            </Stack.Item>
            <IconButton
                styles={styles.button}
                iconProps={{ iconName: "Delete" }}
                ariaLabel={`${translate("bonito.ui.form.delete")} ${ariaLabel}`}
                onClick={() => {
                    onDelete(index);
                }}
                disabled={disableDelete}
            />
        </Stack>
    );
}

function useStringListItemStyles(props: StringListItemProps) {
    const theme = useAppTheme();
    const { disableDelete } = props;

    return React.useMemo(() => {
        const itemPadding = {
            padding: "11px 8px 11px 12px",
        };
        return {
            container: {
                root: {
                    ":hover": {
                        backgroundColor: theme.palette.neutralLighter,
                    },
                },
            },
            input: {
                root: {
                    ...itemPadding,
                },
                field: {
                    height: "24px",
                },
                fieldGroup: {
                    height: "24px",
                    "box-sizing": "content-box",
                },
            },
            button: {
                root: {
                    ...itemPadding,
                    visibility: disableDelete ? "hidden" : "initial",
                },
            },
        };
    }, [theme.palette.neutralLighter, disableDelete]);
}
