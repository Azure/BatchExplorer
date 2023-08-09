import { getLogger } from "@azure/bonito-core";
import {
    FormValues,
    ParameterDependencies,
    ParameterName,
} from "@azure/bonito-core/lib/form";
import * as React from "react";
import { useFormParameter, useUniqueId } from "../../hooks";
import { FormControlProps } from "./form-control";
import { Checkbox as FluentCheckbox } from "@fluentui/react/lib/Checkbox";

/**
 * A check box form control
 */
export function Checkbox<
    V extends FormValues,
    K extends ParameterName<V>,
    D extends ParameterDependencies<V> = ParameterDependencies<V>
>(props: FormControlProps<V, K, D>): JSX.Element {
    const { ariaLabel, className, disabled, onChange, param } = props;

    const id = useUniqueId("form-control", props.id);

    // needed to trigger re-render when the param value changes
    useFormParameter(param);

    return (
        <FluentCheckbox
            id={id}
            ariaLabel={ariaLabel ?? param.label}
            className={className}
            disabled={disabled || param.disabled}
            checked={valueToChecked(param.name, param.value)}
            onChange={(event, newValue) => {
                param.value = newValue as V[K];
                if (onChange) {
                    onChange(event as React.FormEvent, param.value);
                }
            }}
        />
    );
}

function valueToChecked(
    paramName: string,
    value: unknown
): boolean | undefined {
    let checked: boolean | undefined;
    if (value == null) {
        checked = undefined;
    } else if (value === true) {
        checked = true;
    } else if (value === false) {
        checked = false;
    } else {
        getLogger("Checkbox").warn(
            "Invalid boolean value for parameter " + paramName
        );
        checked = undefined;
    }
    return checked;
}
