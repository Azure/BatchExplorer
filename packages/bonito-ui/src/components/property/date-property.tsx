import { toIsoLocal } from "@azure/bonito-core";
import * as React from "react";
import { PropertyField } from "./property-field";

export interface DatePropertyProps {
    label?: string;
    value?: Date;
    hideCopyButton?: boolean;
    labelStyle?: React.CSSProperties;
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
            hideCopyButton={props.hideCopyButton}
            labelStyle={props.labelStyle}
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
