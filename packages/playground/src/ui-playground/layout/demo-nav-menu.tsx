import * as React from "react";
import { Nav, INavStyles, INavLinkGroup } from "@fluentui/react/lib/Nav";

export const DemoNavMenu: React.FC = () => {
    const navStyles: Partial<INavStyles> = {
        root: { width: 230, overflow: "visible", position: "static" },
    };

    const navLinkGroups: INavLinkGroup[] = [
        {
            name: "Form",
            expandAriaLabel: "Expand Form section",
            collapseAriaLabel: "Collapse Form section",
            links: [
                {
                    key: "Button",
                    name: "Button",
                    url: "#/playground/button",
                },
                {
                    key: "Checkbox",
                    name: "Checkbox",
                    url: "#/playground/checkbox",
                },
                {
                    key: "ComboBox",
                    name: "ComboBox",
                    url: "#/playground/combobox",
                },
                {
                    key: "SearchBox",
                    name: "SearchBox",
                    url: "#/playground/searchbox",
                },
                {
                    key: "TextField",
                    name: "TextField",
                    url: "#/playground/textfield",
                },
            ],
        },
        {
            name: "Batch components",
            expandAriaLabel: "Expand Batch components section",
            collapseAriaLabel: "Collapse Batch components section",
            links: [
                {
                    key: "Quota",
                    name: "Quota",
                    url: "#/playground/quota",
                },
                {
                    key: "Resources",
                    name: "Resources",
                    url: "#/playground/resources",
                },
                {
                    key: "Subscriptions",
                    name: "Subscriptions",
                    url: "#/playground/subscriptions",
                },
                {
                    key: "Tab",
                    name: "Tab",
                    url: "#/playground/tab",
                },
                {
                    key: "Toolbar",
                    name: "Toolbar",
                    url: "#/playground/toolbar",
                },
            ],
        },
        {
            name: "Displays",
            expandAriaLabel: "Expand Displays section",
            collapseAriaLabel: "Collapse Displays section",
            links: [
                {
                    key: "Certificate",
                    name: "Certificate",
                    url: "#/playground/certificate",
                },
                {
                    key: "CreateItem",
                    name: "Create Item",
                    url: "#/playground/createitem",
                },
                {
                    key: "File",
                    name: "File",
                    url: "#/playground/file",
                },
                {
                    key: "PoolGraph",
                    name: "Pool Graph",
                    url: "#/playground/poolgraph",
                },
                {
                    key: "JobSpecification",
                    name: "Job Specification",
                    url: "#/playground/jobspecification",
                },
                {
                    key: "Nodes",
                    name: "Nodes",
                    url: "#/playground/nodes",
                },
                {
                    key: "Packages",
                    name: "Packages",
                    url: "#/playground/packages",
                },
                {
                    key: "Tasks",
                    name: "Tasks",
                    url: "#/playground/tasks",
                },
            ],
        },
    ];

    return (
        <div>
            <div>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    <li>
                        <Nav
                            styles={navStyles}
                            ariaLabel="Nav for playground components"
                            groups={navLinkGroups}
                        />
                    </li>
                </ul>
            </div>
        </div>
    );
};
