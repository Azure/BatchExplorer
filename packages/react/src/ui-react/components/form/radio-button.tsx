import * as React from "react";

import { FormControlProps } from "./form-control";
import { ChoiceGroup as FluentRadioButton } from "@fluentui/react/lib/ChoiceGroup";

export interface RadioButtonProps<V> extends FormControlProps<V> {
    options: RadioButtonOption[];
    defaultSelectedKey?: string;
    selectedKey?: string;
}

export interface RadioButtonOption {
    key: string;
    text: string;
}

export function RadioButton<V>(props: RadioButtonProps<V>): JSX.Element {
    const {
        id,
        className,
        disabled,
        label,
        placeholder,
        defaultSelectedKey,
        selectedKey,
        options,
        onChange,
    } = props;

    return (
        <FluentRadioButton
            id={id}
            className={className}
            disabled={disabled}
            label={label}
            placeholder={placeholder}
            defaultSelectedKey={defaultSelectedKey}
            selectedKey={selectedKey}
            options={options}
            onChange={(event, option) => {
                if (event && option && onChange) {
                    // TODO: Key probably isn't right here
                    onChange(event, option.key as unknown as V);
                }
            }}
        />
    );
}
