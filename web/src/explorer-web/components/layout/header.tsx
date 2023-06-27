import { useAppTheme } from "@batch/ui-react/lib/theme";
import * as React from "react";

export const HEADER_HEIGHT = "48px";

export const Header: React.FC = (props) => {
    const theme = useAppTheme();
    return (
        <header
            style={{
                top: 0,
                padding: "0 16px",
                width: "100%",
                position: "fixed",
                overflow: "hidden",
                display: "flex",
                justifyContent: "space-between",
                color: theme.semanticColors.appHeaderText,
                backgroundColor: theme.semanticColors.appHeaderBackground,
                height: HEADER_HEIGHT,
                zIndex: 9999,
            }}
        >
            <h1
                style={{
                    fontSize: "1.5em",
                    margin: 0,
                    padding: 0,
                    fontWeight: 600,
                    lineHeight: HEADER_HEIGHT,
                    userSelect: "none",
                }}
            >
                Batch Explorer
            </h1>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                {props.children}
            </div>
        </header>
    );
};
