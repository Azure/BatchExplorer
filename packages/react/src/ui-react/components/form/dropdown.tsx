import * as React from "react";
import { FormControlProps } from "./form-control";
import {
    Dropdown as FluentDropdown,
    IDropdownOption as FluentDropdownOption,
} from "@fluentui/react/lib/Dropdown";

export interface DropdownProps<V> extends FormControlProps<V> {
    options: DropdownOption<V>[];
}

export interface DropdownOption<V> {
    value: V;
    label?: string;
}

const undefinedKey = "<- No selection ->";
const nullKey = "<- None ->";

/**
 * A simple dropdown form control supporting single selection
 */
export function Dropdown<V>(props: DropdownProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }
    return (
        <FluentDropdown
            ariaLabel={props.ariaLabel}
            className={props.className}
            disabled={props.disabled}
            errorMessage={props.errorMessage}
            label={props.label}
            selectedKey={valueToKey(props.value)}
            options={_transformOptions(props)}
            onChange={(event, option, index) => {
                if (props.onChange && index != null) {
                    props.onChange(props.options[index].value);
                }
            }}
        ></FluentDropdown>
    );
}

function valueToKey<V>(value: V): string {
    if (value === undefined) {
        return undefinedKey;
    }
    if (value === null) {
        return nullKey;
    }

    const stringValue = String(value);
    if (stringValue === undefinedKey || stringValue === nullKey) {
        throw new Error(
            `Invalid key "${stringValue}". Cannot use a key which is reserved for null or undefined values.`
        );
    }
    return stringValue;
}

function _transformOptions<V>(props: DropdownProps<V>): FluentDropdownOption[] {
    const { options } = props;
    let index = 0;
    return options.map((option) => {
        const key = valueToKey(option.value);
        return {
            key: key,
            text: option.label ?? key,
            index: index++,
        };
    });
}
