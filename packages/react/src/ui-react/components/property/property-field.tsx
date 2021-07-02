import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";

export interface PropertyFieldProps<T> {
    label?: string;
    value?: T;
    renderLabel?: (label?: string) => React.ReactNode;
    renderValue?: (value?: T) => React.ReactNode;
}

/**
 * Displays a single key/value pair with an icon to copy the value to
 * the clipboard
 */
export function PropertyField<T>(props: PropertyFieldProps<T>): JSX.Element {
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
}
PropertyField.defaultProps = {
    renderLabel: (label: string) => (label ? label : "-"),
    renderValue: (value: unknown) => (value ? String(value) : "-"),
};
