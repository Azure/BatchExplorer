import { FormValues, ParameterName } from "@azure/bonito-core/lib/form";
import {
    TextField as FluentTextField,
    ITextFieldProps,
} from "@fluentui/react/lib/TextField";
import * as React from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";
import { translate } from "@azure/bonito-core";

export interface TextFieldProps<
    V extends FormValues,
    K extends ParameterName<V>
> extends FormControlProps<V, K> {
    /**
     * The type of input to display.
     */
    type?: "text" | "password";
}

/**
 * A simple text input form control
 */
export function TextField<V extends FormValues, K extends ParameterName<V>>(
    props: TextFieldProps<V, K>
): JSX.Element {
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

    const typeSpecificProps: ITextFieldProps = {};
    const type = props.type ?? "text";
    if (type === "password") {
        typeSpecificProps.type = "password";
        typeSpecificProps.canRevealPassword = true;
        typeSpecificProps.revealPasswordAriaLabel = translate(
            "bonito.ui.form.showPassword"
        );
    }

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
            {...typeSpecificProps}
        ></FluentTextField>
    );
}
