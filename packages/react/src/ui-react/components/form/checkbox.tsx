import * as React from "react";
import { FormControlProps } from "./form-control";

import { Checkbox as FluentCheckbox } from "@fluentui/react/lib/Checkbox";

export interface CheckboxProps extends FormControlProps<boolean | undefined> {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    defaultIndeterminate?: boolean;
    boxSide?: "start" | "end";
}

export function Checkbox(props: CheckboxProps): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    const properties = {
        id: props.id,
        ariaLabel: props.ariaLabel,
        className: props.className,
        disabled: props.disabled,
        label: props.label,
        checked: props.checked,
        defaultChecked: props.defaultChecked,
        indeterminate: props.indeterminate,
        defaultIndeterminate: props.defaultIndeterminate,
        boxSide: props.boxSide,
    };

    return (
        <FluentCheckbox
            {...properties}
            onChange={(event, checked) => {
                if (event && props.onChange) {
                    props.onChange(event, !!checked);
                }
            }}
        ></FluentCheckbox>
    );
}
