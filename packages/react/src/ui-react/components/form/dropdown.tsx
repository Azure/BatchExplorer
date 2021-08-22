import * as React from "react";
import { BaseFormControlProps } from "./types";
import {
    Dropdown as FluentDropdown,
    IDropdownOption as FluentDropdownOption,
} from "@fluentui/react/lib/Dropdown";

export interface DropdownProps<T> extends BaseFormControlProps<T> {
    options: DropdownOption<T>[];
}

export interface DropdownOption<T> {
    value: T;
    label?: string;
}

/**
 * A simple dropdown form control supporting single selection
 */
export function Dropdown<T>(props: DropdownProps<T>): JSX.Element {
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
            options={_transformOptions(props.value, props.options)}
        ></FluentDropdown>
    );
}

function _transformOptions<T>(
    value: T,
    options: DropdownOption<T>[]
): FluentDropdownOption[] {
    let index = 0;
    return options.map((option) => {
        const valueString = String(option.value);
        return {
            key: valueString,
            text: option.label ?? valueString,
            index: index++,
            selected: value === option.value,
        };
    });
}
