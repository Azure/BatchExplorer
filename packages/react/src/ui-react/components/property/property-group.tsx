import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";

export interface PropertyGroupProps {
    title?: string;
    label?: string;
}

/**
 * Displays a grouping of key/value pairs with an optional title
 */
export const PropertyGroup: React.FC<PropertyGroupProps> = (props) => {
    const titleEl = props.title ? <div>{props.title}</div> : undefined;
    return (
        <>
            {titleEl}
            <Stack tokens={{ childrenGap: 8 }}>{props.children}</Stack>
        </>
    );
};
