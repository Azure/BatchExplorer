import * as React from "react";
import { headingStyle } from "../style";

export interface DemoPaneProps extends React.PropsWithChildren {
    title?: string;
}

export const DemoPane: React.FC<DemoPaneProps> = (
    props = {
        title: "Untitled",
    }
) => {
    const { title, children } = props;
    return (
        <div style={{ flex: 1, padding: "16px" }}>
            <h1 style={headingStyle}>{title}</h1>
            {children}
        </div>
    );
};
