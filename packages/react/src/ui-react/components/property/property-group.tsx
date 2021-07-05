import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { useAppTheme } from "../../theme";

export interface PropertyGroupProps {
    title?: string;
    collapsed?: boolean;
}

/**
 * Displays a grouping of key/value pairs with an optional title
 */
export const PropertyGroup: React.FC<PropertyGroupProps> = (props) => {
    const theme = useAppTheme();

    const [collapsed, setCollapsed] = React.useState<boolean>(
        props.collapsed ?? false
    );

    const toggleCollapsed: (
        event: React.MouseEvent<HTMLElement, MouseEvent>
    ) => void = React.useCallback(() => {
        setCollapsed(!collapsed);
    }, [setCollapsed, collapsed]);

    const titleEl = props.title ? (
        <h3
            style={{ color: theme.palette.themePrimary }}
            onClick={toggleCollapsed}
        >
            <Icon
                iconName={collapsed ? "ChevronRight" : "ChevronDown"}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
            ></Icon>
            {props.title}
        </h3>
    ) : undefined;

    return (
        <>
            {titleEl}
            <Stack
                style={{
                    display: collapsed ? "none" : undefined,
                }}
                tokens={{ childrenGap: 8 }}
            >
                {props.children}
            </Stack>
        </>
    );
};
