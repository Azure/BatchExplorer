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
            name: "Displays",
            expandAriaLabel: "Expand Displays section",
            collapseAriaLabel: "Collapse Displays section",
            links: [
                {
                    key: "CertificateDisplay",
                    name: "Certificate Display",
                    url: "#/playground/displays/certificate",
                },
            ],
        },
    ];

    return (
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
    );
};
