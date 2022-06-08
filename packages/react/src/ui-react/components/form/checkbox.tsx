import * as React from "react";
import { FormControlProps } from "./form-control";

import { Checkbox as FluentCheckbox } from "@fluentui/react/lib/Checkbox";

export interface CheckboxProps<V>
    extends FormControlProps<boolean | undefined> {
    checked?: boolean;
    defaultChecked?: boolean;
    indeterminate?: boolean;
    defaultIndeterminate?: boolean;
    boxSide?: "start" | "end";
}

export function Checkbox<V>(props: CheckboxProps<V>): JSX.Element {
    if (props.hidden) {
        return <></>;
    }

    return (
        <FluentCheckbox
            id={props.id}
            ariaLabel={props.ariaLabel}
            className={props.className}
            disabled={props.disabled}
            label={props.label}
            checked={props.checked}
            defaultChecked={props.defaultChecked}
            indeterminate={props.indeterminate}
            defaultIndeterminate={props.defaultIndeterminate}
            boxSide={props.boxSide}
            onChange={(_, checked) => {
                if (props.onChange) {
                    props.onChange(!!checked);
                }
            }}
        ></FluentCheckbox>
    );
}
