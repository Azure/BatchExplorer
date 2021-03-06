import * as React from "react";
import { getTheme } from "@batch/ui-react";
import { ThemeProvider } from "@fluentui/react-theme-provider";
import { loadTheme } from "@fluentui/react/lib/Styling";

export interface RootProps {
    theme?: string;
}

const themeProviderStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: "1 0 auto",
};

export const AppRoot: React.FC<RootProps> = (props) => {
    const theme = getTheme(props.theme ?? "default");
    loadTheme(theme.get());
    return (
        <ThemeProvider theme={theme.get()} style={themeProviderStyles}>
            {props.children}
        </ThemeProvider>
    );
};
