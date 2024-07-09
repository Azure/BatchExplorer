import * as React from "react";
import { Nav, INavStyles, INavLinkGroup } from "@fluentui/react/lib/Nav";
import { getDemoHash } from "../demo-routes";

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
                    key: "ActionForm",
                    name: "Action Form",
                    url: getDemoHash("actionform"),
                },
                {
                    key: "Button",
                    name: "Button",
                    url: getDemoHash("button"),
                },
                {
                    key: "Checkbox",
                    name: "Checkbox",
                    url: getDemoHash("checkbox"),
                },
                {
                    key: "RadioButton",
                    name: "Radio Button",
                    url: getDemoHash("radiobutton"),
                },
                {
                    key: "ComboBox",
                    name: "Combo Box",
                    url: getDemoHash("combobox"),
                },
                {
                    key: "Dropdown",
                    name: "Dropdown",
                    url: getDemoHash("dropdown"),
                },
                {
                    key: "SearchBox",
                    name: "Search Box",
                    url: getDemoHash("searchbox"),
                },
                {
                    key: "TabSelector",
                    name: "Tab Selector",
                    url: getDemoHash("tabselector"),
                },
                {
                    key: "TextField",
                    name: "Text Field",
                    url: getDemoHash("textfield"),
                },
                {
                    key: "Notification",
                    name: "Notification",
                    url: getDemoHash("notification"),
                },
                {
                    key: "StringList",
                    name: "StringList",
                    url: getDemoHash("stringlist"),
                },
            ],
        },
        {
            name: "Displays",
            expandAriaLabel: "Expand Displays section",
            collapseAriaLabel: "Collapse Displays section",
            links: [
                {
                    key: "CertificateDisplay",
                    name: "Certificate Display",
                    url: getDemoHash("certificatedisplay"),
                },
                {
                    key: "DataGridLoadMore",
                    name: "Data Grid: Load More",
                    url: getDemoHash("dataGridLoadMore"),
                },
                {
                    key: "VMExtensionList",
                    name: "VMExtension List Display",
                    url: getDemoHash("vmExtensionList"),
                },
                {
                    key: "TaskList",
                    name: "Task List Display",
                    url: getDemoHash("taskList"),
                },
                {
                    key: "LiveTaskList",
                    name: "Task List Live",
                    url: getDemoHash("liveTaskList"),
                },
            ],
        },
    ];

    return (
        <div style={{ width: "250px", height: "100%" }}>
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
    );
};
