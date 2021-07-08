import { PlaygroundExample } from "@batch/ui-playground";
import { defaultTheme, listThemes } from "@batch/ui-react";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { CertificatePage } from "@batch/ui-react/lib/components/certificate";
import {
    Dropdown,
    IDropdownOption,
    IDropdownStyles,
} from "@fluentui/react/lib/Dropdown";
import * as React from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import { AppRoot } from "./layout/app-root";
import { Footer } from "./layout/footer";
import { Header } from "./layout/header";
import { Main } from "./layout/main";
import { Stack, IStackTokens } from "@fluentui/react/";
import { PrimaryButton } from "@fluentui/react/lib/Button";

//DefaultButton
const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 },
};

/**
 * Represents the entire application
 */
export const Application: React.FC = () => {
    const [theme, setTheme] = React.useState(defaultTheme);

    const themeOptions = React.useMemo(() => {
        const options: IDropdownOption[] = [];
        for (const t of listThemes()) {
            options.push({ key: t.name, text: t.label });
        }
        return options;
    }, []);

    /* const linkStyle = {
        textDecoration: "none",
        color: "white",
        //backgroundColor: "#056ce3",
        backgroundColor: "#0939d6",
        fontSize: "1.2em",
        marginRight: "2em",
    }; */

    const stackTokens: IStackTokens = { childrenGap: 30 };

    return (
        <AppRoot theme={theme}>
            <HashRouter>
                <Header>
                    {/* &nbsp; &nbsp; */}
                    <Stack horizontal tokens={stackTokens}>
                        <Link to="/">
                            <PrimaryButton text="Home"></PrimaryButton>
                        </Link>
                        <Link to="/editor">
                            <PrimaryButton text="Editor"></PrimaryButton>
                        </Link>
                        {/* &nbsp; &nbsp; */}
                        <Link to="/playground">
                            <PrimaryButton text="Playground"></PrimaryButton>
                        </Link>

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
                    </Stack>
                </Header>
                <Main>
                    <Switch>
                        <Route path="/playground">
                            <PlaygroundExample />
                        </Route>
                        <Route path="/editor">
                            <MonacoEditor
                                language="json"
                                containerStyle={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flexGrow: 1,
                                    width: "100%",
                                }}
                                editorOptions={{
                                    minimap: {
                                        enabled: false,
                                    },
                                }}
                            />
                        </Route>
                        <Route path="/">
                            <CertificatePage />
                        </Route>
                    </Switch>
                </Main>
                <Footer />
            </HashRouter>
        </AppRoot>
    );
};
