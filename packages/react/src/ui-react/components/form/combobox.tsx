import {
    ComboBox as FluentComboBox,
    IComboBox,
    IComboBoxOption,
} from "@fluentui/react/lib/ComboBox";
import * as React from "react";
import { FormControlProps } from "./form-control";

export interface ComboBoxProps<V> extends FormControlProps<V> {
    options: ComboBoxOption[];
    multiSelect?: boolean;
    allowFreeform?: boolean;
    autoComplete?: "on" | "off";
    defaultSelectedKey?: string | number | string[] | number[];
    selectedKey?: string | number | string[] | number[];
    onChange?: (
        event: React.FormEvent<IComboBox> | V,
        option?: IComboBoxOption,
        index?: number,
        value?: string
    ) => void;
}

export interface ComboBoxOption {
    key: string;
    text: string;
}

export function ComboBox<V>(props: ComboBoxProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }
    return (
        <FluentComboBox
            id={props.id}
            ariaLabel={props.ariaLabel}
            className={props.className}
            style={props.style}
            disabled={props.disabled}
            hidden={props.hidden}
            errorMessage={props.errorMessage}
            label={props.label}
            onChange={props.onChange}
            placeholder={props.placeholder}
            multiSelect={props.multiSelect}
            allowFreeform={props.allowFreeform}
            autoComplete={props.autoComplete}
            defaultSelectedKey={props.defaultSelectedKey}
            selectedKey={props.selectedKey}
            options={props.options}
        ></FluentComboBox>
    );
}
