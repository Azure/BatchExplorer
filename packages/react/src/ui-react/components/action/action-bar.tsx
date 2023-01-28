import * as React from "react";
import {
    CommandBar,
    ICommandBarItemProps,
} from "@fluentui/react/lib/CommandBar";
import { useAppTheme } from "../../theme";

export interface ActionBarItem extends Omit<ICommandBarItemProps, "onClick"> {
    /**
     * User friendly label of the menu item
     */
    text: string;

    /**
     * Properties for icons rendered alongside (or instead of) item text.
     * Alternatively, the name of the fluent icon to use.
     */
    icon?: ActionBarIcon | string;

    /**
     * Mouse/keyboard activation callback
     */
    onClick?: (
        event?:
            | React.MouseEvent<HTMLElement>
            | React.KeyboardEvent<HTMLElement>,
        item?: ActionBarItem
    ) => boolean | void;
}

export interface ActionBarProps {
    /**
     * A list of action items to render
     */
    items?: ActionBarItem[];

    /**
     * If true, forces all buttons to be rendered with icons only
     */
    iconsOnly?: boolean;
}

export interface ActionBarIcon extends React.HTMLAttributes<HTMLElement> {
    /**
     * The name of the icon. See: https://uifabricicons.azurewebsites.net/
     */
    iconName?: string;
}

export const ActionBar: React.FC<ActionBarProps> = (props) => {
    const theme = useAppTheme();
    const commandBarItems = props.items?.map((item, index) =>
        _toCommandBarItem(props, item, index)
    );
    return <CommandBar theme={theme} items={commandBarItems ?? []} />;
};

function _toCommandBarItem(
    props: ActionBarProps,
    item: ActionBarItem,
    index: number
): ICommandBarItemProps {
    const { text, onClick, icon, ...restItem } = item;

    let commandBarItem: ICommandBarItemProps = {
        key: "bl-action-bar-item-" + index,
        // Use emdash instead of dash to avoid the fluentui behavior
        // of interpreting dashes as a divider item
        text: text === "-" ? "—" : text,
    };

    // Map events
    if (onClick) {
        commandBarItem.onClick = (event) => {
            if (onClick) {
                onClick(event, item);
            }
        };
    }

    if (typeof icon === "string") {
        commandBarItem.iconProps = {
            iconName: icon,
        };
    } else if (icon) {
        commandBarItem.iconProps = {
            ...icon,
        };
    }
    if (props.iconsOnly) {
        commandBarItem.iconOnly = true;
    }

    commandBarItem = { ...commandBarItem, ...restItem };
    return commandBarItem;
}
