import * as React from "react";
import { ThemeName, getTheme } from "../../theme";
import { ThemeProvider } from "@fluentui/react/lib/Theme";
import { loadTheme } from "@fluentui/react/lib/Styling";

export interface RootPaneProps {
    theme?: ThemeName;
}

const themeProviderStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: "1 0 auto",
};

export const RootPane: React.FC<RootPaneProps> = (props) => {
    const theme = getTheme(props.theme ?? "default");

    React.useEffect(() => {
        loadTheme(theme.get());
    }, [theme]);

    return (
        <ThemeProvider theme={theme.get()} style={themeProviderStyles}>
            {props.children}
        </ThemeProvider>
    );
};
