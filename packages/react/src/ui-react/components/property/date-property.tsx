import { toIsoLocal } from "@batch/ui-common";
import * as React from "react";
import { PropertyField } from "./property-field";

export interface DatePropertyProps {
    label?: string;
    value?: Date;
}

/**
 * Displays a property as plain, unformatted text
 */
export const DateProperty: React.FC<DatePropertyProps> = (props) => {
    return (
        <PropertyField
            label={props.label}
            value={props.value}
            renderLabel={(label) => {
                return <label>{label}</label>;
            }}
            renderValue={(value) => {
                return <span>{value ? toIsoLocal(value) : "-"}</span>;
            }}
        />
    );
};
