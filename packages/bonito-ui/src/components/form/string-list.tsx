import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { IconButton } from "@fluentui/react/lib/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";

// export interface StringListProps<
//     V extends FormValues,
//     K extends ParameterName<V>,
//     D extends ParameterDependencies<V> = ParameterDependencies<V>
// > extends FormControlProps<V, K, D> {
// }

export function StringList<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
>(props: FormControlProps<V, K, D>): JSX.Element {
    const { className, style, param, onChange } = props;

    const id = useUniqueId("form-control", props.id);
    useFormParameter(param);

    // const [hasFocused, setHasFocused] = React.useState<boolean>(false);

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
            if (index === items.length - 1) {
                // Last item, add a new one
                items.push("");
            }
            items[index] = value;
            param.value = items.slice(0, items.length - 1) as V[K];
            onChange?.(null as any, param.value);
        },
        [items, param, onChange]
    );

    const onItemDelete = useCallback(
        (index: number) => {
            items.splice(index, 1);
            param.value = items.slice(0, items.length - 1) as V[K];
            onChange?.(null as any, param.value);
        },
        [items, param, onChange]
    );

    return (
        <Stack key={id} style={style} className={className}>
            {items.map((item, index) => {
                return (
                    <StringListItem
                        key={index}
                        index={index}
                        value={item}
                        onChange={onItemChange}
                        onDelete={onItemDelete}
                        disableDelete={index === items.length - 1}
                    ></StringListItem>
                );
            })}
        </Stack>
    );
}

function StringListItem(props: {
    index: number;
    value: string;
    onChange: (index: number, value: string) => void;
    onDelete: (index: number) => void;
    disableDelete?: boolean;
}) {
    const { index, value, onChange, onDelete, disableDelete } = props;
    return (
        <Stack key={index} horizontal>
            <TextField
                value={value}
                onChange={(_, newValue) => {
                    onChange(index, newValue || "");
                }}
            ></TextField>
            <IconButton
                iconProps={{ iconName: "Delete" }}
                onClick={() => {
                    onDelete(index);
                }}
                disabled={disableDelete}
            />
        </Stack>
    );
}
