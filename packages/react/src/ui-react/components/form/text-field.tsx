import * as React from "react";
import { FormControlProps } from "./form-control";
import { TextField as FluentTextField } from "@fluentui/react/lib/TextField";

/**
 * A simple text input form control
 */
export function TextField(
    props: FormControlProps<string | undefined>
): JSX.Element {
    const { dirty, validationForced, validationStatus } = props;

    if (props.hidden) {
        return <></>;
    }

    const errorMessage =
        (dirty || validationForced) && validationStatus?.level === "error"
            ? validationStatus?.message
            : undefined;

    return (
        <FluentTextField
            id={props.id}
            ariaLabel={props.ariaLabel}
            className={props.className}
            disabled={props.disabled}
            errorMessage={errorMessage}
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
