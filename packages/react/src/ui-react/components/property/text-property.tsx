import * as React from "react";
import { PropertyField } from "./property-field";

export interface TextPropertyProps {
    label?: string;
    value?: string;
}

function getText(value?: string): string {
    return value != null ? value : "";
}

/**
 * Displays a property as plain, unformatted text
 */
export const TextProperty: React.FC<TextPropertyProps> = (props) => {
    return (
        <PropertyField
            label={props.label}
            value={props.value}
            renderLabel={(label) => {
                return <label>{label ? label : "-"}</label>;
            }}
            renderValue={(value) => {
                const text = getText(value);
                return <span>{text !== "" ? text : "-"}</span>;
            }}
        />
    );
};
