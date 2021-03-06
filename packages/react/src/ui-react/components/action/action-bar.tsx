import * as React from "react";
import {
    CommandBar,
    ICommandBarItemProps,
} from "@fluentui/react/lib/CommandBar";
import { uniqueId } from "@batch/ui-common";
import { useTheme } from "@fluentui/react-theme-provider";

export interface ActionBarItem {
    /**
     * User friendly label of the menu item
     */
    text: string;

    onClick?: (
        event?:
            | React.MouseEvent<HTMLElement>
            | React.KeyboardEvent<HTMLElement>,
        item?: ActionBarItem
    ) => boolean | void;
}

export interface ActionBarProps {
    items?: ActionBarItem[];
}

export const ActionBar: React.FC<ActionBarProps> = (props) => {
    const theme = useTheme();
    const commandBarItems = props.items?.map((item) => _toCommandBarItem(item));
    return <CommandBar theme={theme} items={commandBarItems ?? []} />;
};

function _toCommandBarItem(item: ActionBarItem): ICommandBarItemProps {
    const commandBarItem: ICommandBarItemProps = {
        key: uniqueId("bl-action-bar-item"),
        // Use emdash instead of dash to avoid the fluentui behavior
        // of interpreting dashes as a divider item
        text: item.text === "-" ? "—" : item.text,
    };

    // Map events
    if (item.onClick) {
        commandBarItem.onClick = (event) => {
            if (item.onClick) {
                item.onClick(event, item);
            }
        };
    }

    return commandBarItem;
}
