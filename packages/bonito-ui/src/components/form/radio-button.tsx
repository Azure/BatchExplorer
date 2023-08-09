import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { ChoiceGroup as FluentChoiceGroup } from "@fluentui/react/lib/ChoiceGroup";
import * as React from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";

export interface RadioButtonProps<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
> extends FormControlProps<V, K, D> {
    options: RadioButtonOption[];
    defaultSelectedKey?: string;
}

export interface RadioButtonOption {
    key: string;
    text: string;
}

export function RadioButton<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
>(props: RadioButtonProps<V, K, D>): JSX.Element {
    const {
        className,
        defaultSelectedKey,
        disabled,
        onFocus,
        onBlur,
        onChange,
        options,
        param,
        style,
    } = props;

    const id = useUniqueId("form-control", props.id);
    const { setDirty } = useFormParameter(param);

    const [hasFocused, setHasFocused] = React.useState<boolean>(false);

    return (
        <FluentChoiceGroup
            id={id}
            className={className}
            style={style}
            disabled={disabled || param.disabled}
            placeholder={param.placeholder}
            defaultSelectedKey={defaultSelectedKey}
            selectedKey={param.value == null ? undefined : String(param.value)}
            options={options}
            onFocus={(event) => {
                setHasFocused(true);
                if (onFocus) {
                    onFocus(event);
                }
            }}
            onBlur={onBlur}
            onChange={(event, option) => {
                if (hasFocused) {
                    setDirty(true);
                }
                if (onChange) {
                    // TODO: Key probably isn't right here
                    onChange(event as React.FormEvent, option?.key as V[K]);
                }
            }}
        />
    );
}
