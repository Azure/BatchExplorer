import * as React from "react";
import { HashRouter as Router } from "react-router-dom";
import { DemoNavMenu } from "./layout/demo-nav-menu";
import { DemoMainContent } from "./layout/demo-main-content";
import {
    Dropdown,
    IDropdownOption,
    IDropdownStyles,
} from "@fluentui/react/lib/Dropdown";
import { defaultTheme, listThemes } from "@batch/ui-react";

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

export const NewRoot: React.FC<RootProps> = (props) => {
    const theme = getTheme(props.theme ?? "default");
    loadTheme(theme.get());
    return (
        <ThemeProvider theme={theme.get()} style={themeProviderStyles}>
            {props.children}
        </ThemeProvider>
    );
};

export interface PlaygroundExampleProps {
    /**
     * Text to display
     */
    text?: string;
}

/**
 * Example component
 */

export const PlaygroundExample: React.FC<PlaygroundExampleProps> = () => {
    const dropdownStyles: Partial<IDropdownStyles> = {
        dropdown: {
            width: 300,
            alignContent: "center",
            justifyContent: "center",
        },
        root: {
            alignContent: "center",
            justifyContent: "center",
        },
    };

    const themeOptions = React.useMemo(() => {
        const options: IDropdownOption[] = [];
        for (const t of listThemes()) {
            options.push({ key: t.name, text: t.label });
        }
        return options;
    }, []);

    const [theme, setTheme] = React.useState(defaultTheme);

    return (
        <NewRoot theme={theme}>
            <div className="hi">
                <h1
                    style={{
                        fontSize: "2em",
                        margin: 0,
                        padding: 0,
                        fontWeight: 600,
                        lineHeight: 4,
                        userSelect: "none",
                        textAlign: "center",
                    }}
                >
                    Shared Component Library Playground
                </h1>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignContent: "center",
                    }}
                >
                    <Dropdown
                        styles={dropdownStyles}
                        defaultSelectedKey={defaultTheme}
                        placeholder="Select a theme"
                        label="Theme"
                        options={themeOptions}
                        onRenderLabel={() => <></>}
                        onChange={(_, option) => {
                            if (option) {
                                setTheme(String(option.key));
                            }
                        }}
                    />
                </div>

                <Router>
                    <div style={{ display: "flex" }}>
                        <div
                            style={{
                                padding: "2px",
                                width: "20%", //distance between "sidebar" and the actual elements being displayed
                                //background: "#f0f0f0",
                            }}
                        >
                            <DemoNavMenu />
                        </div>

                        <DemoMainContent />
                    </div>
                </Router>
            </div>
        </NewRoot>
    );
};
