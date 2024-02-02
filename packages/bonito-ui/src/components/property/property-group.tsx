import { uniqueElementId } from "@azure/bonito-core";
import { Icon } from "@fluentui/react/lib/Icon";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { useAppTheme } from "../../theme";

export interface PropertyGroupProps {
    title?: string;
    collapsed?: boolean;
    enableCollapse?: boolean;
    titleStyle?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
}

/**
 * Displays a grouping of key/value pairs with an optional title
 */
export const PropertyGroup: React.FC<PropertyGroupProps> = (props) => {
    const theme = useAppTheme();

    const { enableCollapse = true, titleStyle, containerStyle } = props;

    const [collapsed, setCollapsed] = React.useState<boolean>(
        props.collapsed ?? false
    );

    const toggleCollapsed: (
        event: React.MouseEvent | React.KeyboardEvent
    ) => void = React.useCallback(
        (event) => {
            if (!enableCollapse) {
                return;
            }
            let shouldToggle = false;

            const nativeEvent = event.nativeEvent;
            if (
                nativeEvent instanceof KeyboardEvent &&
                (nativeEvent.key === " " || nativeEvent.key === "Enter")
            ) {
                shouldToggle = true;
            } else if (nativeEvent instanceof MouseEvent) {
                shouldToggle = true;
            }

            if (shouldToggle) {
                setCollapsed(!collapsed);
            }
        },
        [setCollapsed, collapsed, enableCollapse]
    );

    const sectionId = uniqueElementId("property-group-section");

    const titleEl = props.title ? (
        <h3
            style={{
                color: theme.palette.themePrimary,
                ...(enableCollapse ? { cursor: "pointer" } : {}),
                ...titleStyle,
            }}
            tabIndex={0}
            onClick={toggleCollapsed}
            onKeyDown={toggleCollapsed}
            aria-controls={sectionId}
            aria-expanded={collapsed ? false : true}
        >
            {enableCollapse && (
                <Icon
                    data-testid="collapse-icon"
                    iconName={collapsed ? "ChevronRight" : "ChevronDown"}
                    style={{ marginRight: "8px", verticalAlign: "middle" }}
                ></Icon>
            )}
            {props.title}
        </h3>
    ) : undefined;

    return (
        <div style={containerStyle}>
            {titleEl}
            <Stack
                id={sectionId}
                data-testid="property-group-section"
                style={{
                    display: collapsed ? "none" : undefined,
                }}
                tokens={{ childrenGap: 10 }}
            >
                {props.children}
            </Stack>
        </div>
    );
};
