import { Pivot, PivotItem } from "@fluentui/react/lib/Pivot";
import * as React from "react";
import { ContentPane } from "./content-pane";

export interface TabContainerProps {
    ariaLabel?: string;
}

export const TabContainer: React.FC<TabContainerProps> = (props) => {
    const tabProps: TabProps[] = [];
    React.Children.forEach(props.children, (child) => {
        if (React.isValidElement(child)) {
            tabProps.push(child.props);
        }
    });

    let tabIndex = 0;
    const items: JSX.Element[] = [];
    for (const p of tabProps) {
        const name = p.name ?? "tab-" + tabIndex;
        items.push(
            <PivotItem key={name} headerText={name}>
                <ContentPane>{p.children}</ContentPane>
            </PivotItem>
        );
        tabIndex++;
    }

    return <Pivot aria-label={props.ariaLabel}>{items}</Pivot>;
};

export interface TabProps {
    name?: string;
    children?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = () => {
    // Rendering is controlled entirely by TabContainer
    return (
        <div>Cannot render tab: Tabs must be placed inside a tab container</div>
    );
};
