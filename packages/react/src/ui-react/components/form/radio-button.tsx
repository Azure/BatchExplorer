import * as React from "react";

import { FormControlProps } from "./form-control";
import { IChoiceGroupOption } from "@fluentui/react/lib/ChoiceGroup";
import { ChoiceGroup as FluentRadioButton } from "@fluentui/react/lib/ChoiceGroup";

export interface RadioButtonProps<V> extends FormControlProps<V> {
    options: RadioButtonOption[];
    defaultSelectedKey?: string;
    selectedKey?: string;
    onChange?: (
        ev?: V | React.FormEvent<HTMLElement | HTMLInputElement> | undefined,
        option?: IChoiceGroupOption | undefined
    ) => void;
}

export interface RadioButtonOption {
    key: string;
    text: string;
}

export function RadioButton<V>(props: RadioButtonProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    return (
        <FluentRadioButton
            id={props.id}
            className={props.className}
            disabled={props.disabled}
            label={props.label}
            placeholder={props.placeholder}
            defaultSelectedKey={props.defaultSelectedKey}
            selectedKey={props.selectedKey}
            options={props.options}
            onChange={props.onChange}
        ></FluentRadioButton>
    );
}
