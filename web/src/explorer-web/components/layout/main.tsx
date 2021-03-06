import * as React from "react";
import { HEADER_HEIGHT } from "./header";

const mainStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: "1 0 auto",
    marginTop: HEADER_HEIGHT,
};

export const Main: React.FC = (props) => {
    return <main style={mainStyles}>{props.children}</main>;
};
