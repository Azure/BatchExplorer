import { TextField as FluentTextField } from "@fluentui/react/lib/TextField";
import * as React from "react";
import { FormControlProps } from "./form-control";

export interface TextFieldProps<V> extends FormControlProps<V> {
    required?: boolean;
    textFieldLabel?: string;
}

/**
 * A simple text input form control
 */
export function TextField(
    props: TextFieldProps<string | undefined>
): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    return (
        <FluentTextField
            id={props.id}
            ariaLabel={props.ariaLabel}
            label={props.textFieldLabel}
            className={props.className}
            disabled={props.disabled}
            required={props.required}
            errorMessage={props.errorMessage}
            value={props.value == null ? "" : props.value}
            onChange={(_, newValue) => {
                if (props.onChange) {
                    props.onChange(
                        newValue === "" ? undefined : String(newValue)
                    );
                }
            }}
        ></FluentTextField>
    );
}
