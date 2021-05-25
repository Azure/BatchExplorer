import { defaultTheme, listThemes } from "@batch/ui-react";
import { CertificatePage } from "@batch/ui-react/lib/components/certificate";
import {
    Dropdown,
    IDropdownOption,
    IDropdownStyles,
} from "@fluentui/react/lib/Dropdown";
import * as React from "react";
import { AppRoot } from "./layout/app-root";
import { Footer } from "./layout/footer";
import { Header } from "./layout/header";
import { Main } from "./layout/main";

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

    return (
        <AppRoot theme={theme}>
            <Header>
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
            </Header>
            <Main>
                <CertificatePage />
            </Main>
            <Footer />
        </AppRoot>
    );
};
