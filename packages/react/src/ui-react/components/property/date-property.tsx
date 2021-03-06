import { toIsoLocal } from "@batch/ui-common";
import * as React from "react";
import { PropertyField } from "./property-field";

export interface DatePropertyProps {
    label?: string;
    value?: Date;
}

function getText(value?: Date): string {
    return value ? toIsoLocal(value) : "";
}

/**
 * Displays a property as plain, unformatted text
 */
export const DateProperty: React.FC<DatePropertyProps> = (props) => {
    return (
        <PropertyField
            label={props.label}
            value={props.value}
            getText={getText}
            renderLabel={(label) => {
                return <label>{label}</label>;
            }}
            renderValue={(value) => {
                const text = getText(value);
                return <span>{text !== "" ? text : "-"}</span>;
            }}
        />
    );
};
