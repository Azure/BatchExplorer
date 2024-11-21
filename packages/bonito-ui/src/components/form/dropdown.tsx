import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { delayedCallback } from "@azure/bonito-core/lib/util";
import {
    Dropdown as FluentDropdown,
    IDropdownOption as FluentDropdownOption,
} from "@fluentui/react/lib/Dropdown";
import * as React from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";

export interface DropdownProps<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
> extends FormControlProps<V, K, D> {
    options: DropdownOption<V, K>[];
    valueToKey?: (value?: V[K]) => string;
}

export interface DropdownOption<
    V extends FormValues,
    K extends ParameterName<V>,
> {
    key?: string;
    value: V[K];
    label?: string;
}

const undefinedKey = "<<<No selection>>>";
const nullKey = "<<<None>>>";

/**
 * A simple dropdown form control supporting single selection
 */
export function Dropdown<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>,
>(props: DropdownProps<V, K, D>): JSX.Element {
    const {
        ariaLabel,
        className,
        disabled,
        onFocus,
        onBlur,
        onChange,
        options,
        param,
        style,
        valueToKey,
    } = props;

    const id = useUniqueId("form-control", props.id);
    const { validationError, setDirty } = useFormParameter(param);

    const [hasFocused, setHasFocused] = React.useState<boolean>(false);

    // Default to first option if the parameter is required
    if (param.required && param.value == null && options.length > 0) {
        // Do this asynchronously so that the current render finishes first
        delayedCallback(() => {
            param.value = options[0].value;
        });
    }

    const toKey = valueToKey ?? defaultValueToKey;
    return (
        <FluentDropdown
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            style={style}
            disabled={disabled || param.disabled}
            placeholder={param.placeholder}
            errorMessage={validationError}
            selectedKey={param.value == null ? undefined : toKey(param.value)}
            options={_transformOptions(options, valueToKey)}
            onFocus={(event) => {
                setHasFocused(true);
                if (onFocus) {
                    onFocus(event);
                }
            }}
            onBlur={onBlur}
            onChange={(event, _, index) => {
                if (hasFocused) {
                    setDirty(true);
                }
                if (index != null) {
                    param.value = options[index].value as V[K];
                    if (onChange) {
                        onChange(event, param.value);
                    }
                }
            }}
        ></FluentDropdown>
    );
}

function defaultValueToKey<V>(value?: V): string {
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

function _transformOptions<V extends FormValues, K extends ParameterName<V>>(
    options: DropdownOption<V, K>[],
    valueToKey?: (value?: V[K]) => string
): FluentDropdownOption[] {
    const toKey = valueToKey ?? defaultValueToKey;
    let index = 0;
    return options.map((option) => {
        const key = toKey(option.value);
        return {
            key: key,
            text: option.label ?? key,
            index: index++,
        };
    });
}
