import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import { TextField as FluentTextField } from "@fluentui/react/lib/TextField";
import * as React from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";

/**
 * A simple text input form control
 */
export function TextField<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
>(props: FormControlProps<V, K, D>): JSX.Element {
    const {
        ariaLabel,
        className,
        disabled,
        onFocus,
        onBlur,
        onChange,
        param,
        style,
    } = props;

    const id = useUniqueId("form-control", props.id);
    const { validationError, setDirty } = useFormParameter(param);

    const [hasFocused, setHasFocused] = React.useState<boolean>(false);

    return (
        <FluentTextField
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            style={style}
            disabled={disabled || param.disabled}
            placeholder={param.placeholder}
            errorMessage={validationError}
            value={param.value == null ? "" : String(param.value)}
            onFocus={(event) => {
                setHasFocused(true);
                if (onFocus) {
                    onFocus(event);
                }
            }}
            onBlur={onBlur}
            onChange={(event, newValue) => {
                if (hasFocused) {
                    setDirty(true);
                }
                const value = (newValue === "" ? undefined : newValue) as V[K];
                param.value = value;
                if (onChange) {
                    onChange(event, value);
                }
            }}
        ></FluentTextField>
    );
}
