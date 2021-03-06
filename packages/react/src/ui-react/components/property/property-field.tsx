import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";

export interface PropertyFieldProps {
    label?: string;
    value?: unknown;
    renderLabel?: (label?: string) => React.ReactNode;
    renderValue?: (value?: unknown) => React.ReactNode;
}

/**
 * Displays a single key/value pair with an icon to copy the value to
 * the clipboard
 */
export const PropertyField: React.FC<PropertyFieldProps> = (props) => {
    return (
        <>
            <Stack tokens={{ childrenGap: 8 }} horizontal>
                <div data-testid="label" className="property-label">
                    {props.renderLabel && props.renderLabel(props.label)}
                </div>
                <div data-testid="content" className="property-content">
                    {props.renderValue && props.renderValue(props.value)}
                </div>
                <div data-testid="clipboard" className="clipboard-button">
                    Clippy
                </div>
            </Stack>
        </>
    );
};
PropertyField.defaultProps = {
    renderLabel: (label) => (label ? label : ""),
    renderValue: (value) => (value ? String(value) : ""),
};
