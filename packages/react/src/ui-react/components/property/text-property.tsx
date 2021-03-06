import * as React from "react";
import { PropertyField } from "./property-field";

export interface TextPropertyProps {
    label?: string;
    value?: string;
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
                return <label>{label}</label>;
            }}
            renderValue={(value) => {
                return <span>{String(value)}</span>;
            }}
        />
    );
};
