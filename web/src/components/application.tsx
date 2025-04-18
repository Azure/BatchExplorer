import { PlaygroundExample } from "@batch/ui-playground";
import { defaultTheme, listThemes } from "@azure/bonito-ui";
import { MonacoEditor } from "@azure/bonito-ui/lib/components";
import { CertificatePage } from "@batch/ui-react/lib/components/certificate";
import {
    Dropdown,
    IDropdownOption,
    IDropdownStyles,
} from "@fluentui/react/lib/Dropdown";
import * as React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppRoot } from "./layout/app-root";
import { Footer } from "./layout/footer";
import { Header } from "./layout/header";
import { Main } from "./layout/main";
import { Stack, IStackTokens } from "@fluentui/react/lib/Stack";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { translate } from "@azure/bonito-core";
import { ThemeName } from "@azure/bonito-ui/lib/theme";

//DefaultButton
const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: { width: 300 },
};

/**
 * Represents the entire application
 */
export const Application: React.FC = () => {
    const [theme, setTheme] = React.useState<ThemeName>(defaultTheme);

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
            <BrowserRouter>
                <Header>
                    <Stack horizontal tokens={stackTokens}>
                        <PrimaryButton
                            text={translate("application.buttons.home")}
                            href="/"
                        ></PrimaryButton>
                        <PrimaryButton
                            text={translate("application.buttons.editor")}
                            href="/editor"
                        ></PrimaryButton>
                        <PrimaryButton
                            text={translate("application.buttons.playground")}
                            href="/playground"
                        ></PrimaryButton>

                        <Dropdown
                            styles={dropdownStyles}
                            defaultSelectedKey={defaultTheme}
                            placeholder="Select a theme"
                            label="Theme"
                            options={themeOptions}
                            onRenderLabel={() => <></>}
                            onChange={(_, option) => {
                                if (option) {
                                    setTheme(option.key as ThemeName);
                                }
                            }}
                        />
                    </Stack>
                </Header>
                <Main>
                    <Routes>
                        <Route
                            path="/playground"
                            element={<PlaygroundExample />}
                        />
                        <Route
                            path="/editor"
                            element={
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
                            }
                        />
                        <Route path="/" element={<CertificatePage />} />
                    </Routes>
                </Main>
                <Footer />
            </BrowserRouter>
        </AppRoot>
    );
};
