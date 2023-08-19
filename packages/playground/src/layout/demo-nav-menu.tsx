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
                    name: "ActionForm",
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
                    name: "ComboBox",
                    url: getDemoHash("combobox"),
                },
                {
                    key: "Dropdown",
                    name: "Dropdown",
                    url: getDemoHash("dropdown"),
                },
                {
                    key: "SearchBox",
                    name: "SearchBox",
                    url: getDemoHash("searchbox"),
                },
                {
                    key: "TextField",
                    name: "TextField",
                    url: getDemoHash("textfield"),
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
