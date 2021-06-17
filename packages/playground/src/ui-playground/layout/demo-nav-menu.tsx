import { DefaultButton } from "@fluentui/react/lib/Button";
import * as React from "react";
import { Link } from "react-router-dom";
import { categoryStyle, linkStyle } from "../style";

export const DemoNavMenu: React.FC = () => {
    return (
        <ul style={{ listStyleType: "none", padding: 0 }}>
            <DemoCategoryTitle title="Generic Components" />
            <DemoLink url="/button" label="Button" />
            <DemoLink url="/checkbox" label="Checkbox" />
            <DemoLink url="/combobox" label="ComboBox" />
            <DemoLink url="/dropdown" label="Dropdown" />
            <DemoLink url="/graph" label="Graph" />
            <DemoLink url="/searchbox" label="SearchBox" />
            <DemoLink url="/textfield" label="TextField" />

            <DemoCategoryTitle title="Batch Components" />
            <DemoLink url="/galleryapplication" label="Gallery Application" />
            <DemoLink url="/quota" label="Quota" />
            <DemoLink url="/resources" label="Resources" />
            <DemoLink url="/tab" label="Tab" />
            <DemoLink url="/toolbar" label="Toolbar" />

            <DemoCategoryTitle title="Displays" />
            <DemoLink url="/configuration" label="Configuration" />
            <DemoLink url="/createitem" label="Create Item" />
            <DemoLink url="/file" label="File" />
            <DemoLink url="/poolgraph" label="Pool Graph" />
            <DemoLink url="/jobspecification" label="Job Specification" />
            <DemoLink url="/nodes" label="Nodes" />
            <DemoLink url="/packages" label="Packages" />
            <DemoLink url="/tasks" label="Tasks" />
        </ul>
    );
};

const DemoCategoryTitle: React.FC<{
    title: string;
}> = (props) => {
    return (
        <li>
            <h2 style={categoryStyle}>{props.title}</h2>
        </li>
    );
};

interface DemoLinkProps {
    url: string;
    label: string;
}

const DemoLink: React.FC<DemoLinkProps> = (props) => {
    const { url, label } = props;
    return (
        <li>
            <Link to={url}>
                <DefaultButton text={label} style={linkStyle}></DefaultButton>
                {props.children}
            </Link>
        </li>
    );
};
