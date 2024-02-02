import * as React from "react";
import { PropertyField } from "./property-field";
import { TextField } from "@fluentui/react/lib/TextField";

export interface TextPropertyProps {
    label?: string;
    value?: string;
    multiline?: boolean;
    multilineMaxHeight?: number;
    hideCopyButton?: boolean;
    labalStyle?: React.CSSProperties;
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
            hideCopyButton={props.hideCopyButton}
            labalStyle={props.labalStyle}
            renderLabel={(label) => {
                return <label>{label ? label : "-"}</label>;
            }}
            renderValue={(value) => {
                const text = getText(value);
                if (props.multiline) {
                    return (
                        <TextField
                            ariaLabel={props.label}
                            data-testid="text-property-textfield"
                            readOnly
                            style={{
                                maxHeight: props.multilineMaxHeight || 160,
                                overflow: "auto",
                            }}
                            value={text}
                            autoAdjustHeight
                            multiline
                            contentEditable={false}
                            resizable={false}
                        ></TextField>
                    );
                }
                return (
                    <span data-testid="text-property-span">
                        {text !== "" ? text : "-"}
                    </span>
                );
            }}
        />
    );
};
