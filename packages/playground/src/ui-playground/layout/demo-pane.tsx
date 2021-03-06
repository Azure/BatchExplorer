import * as React from "react";
import { headingStyle } from "../style";

export interface DemoPaneProps {
    title?: string;
}

export const DemoPane: React.FC<DemoPaneProps> = (props) => {
    const { title, children } = props;
    return (
        <div style={{ flex: 1, padding: "10px" }}>
            <h1 style={headingStyle}>{title}</h1>
            {children}
        </div>
    );
};
DemoPane.defaultProps = {
    title: "Untitled",
};
