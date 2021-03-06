import { getEnvironment, DependencyName } from "@batch/ui-common";
import { MockHttpClient, MockHttpResponse } from "@batch/ui-common/lib/http";
import { defaultTheme, listThemes, useAsyncEffect } from "@batch/ui-react";
import {
    CertificateDisplay,
    DisplayPane,
} from "@batch/ui-react/lib/components";
import { Certificate, CertificateService } from "@batch/ui-service";
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

const getCert = async (): Promise<Certificate | null> => {
    // Mock out the call to get certificate until HTTP auth is supported
    const httpClient: MockHttpClient = getEnvironment().getInjectable(
        DependencyName.HttpClient
    );
    const certUrl =
        "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)?api-version=2020-09-01.12.0";
    httpClient.addExpected(
        new MockHttpResponse(
            certUrl,
            200,
            `{
                "thumbprint": "bd7c0d29efad85c5174364c330db1698b14f7f55",
                "thumbprintAlgorithm": "sha1",
                "url": "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)",
                "state": "active",
                "stateTransitionTime": "2021-05-22T15:42:27.189Z",
                "publicData": "MIICMTCCAZqgAwIBAgIQGroSHQekS6dHgBwHcOmihzANBgkqhkiG9w0BAQUFADBXMVUwUwYDVQQDHkwAewAxADAAQQBDADEAQQAzAEMALQBFADgAQgAwAC0ANABCADMANgAtADgAMAA0AEYALQBFADkARQBFAEEANwBGADQANgBEAEEAQQB9MB4XDTE2MDMwODAwMjcyM1oXDTE3MDMwODA2MjcyM1owVzFVMFMGA1UEAx5MAHsAMQAwAEEAQwAxAEEAMwBDAC0ARQA4AEIAMAAtADQAQgAzADYALQA4ADAANABGAC0ARQA5AEUARQBBADcARgA0ADYARABBAEEAfTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAvUBbyvBVcVfL3eGBUQDBi6+LNYz5YCyxXZD22b0jKBvjwyY6tzvFPW/dZsSJ9ruwkc5YX4O9iS366z9ot3ZDcXP1jievVmT+ljFpBScrNDtHtw4NGSBYbb4JGqHPpvUMNbLDc+0pOBC2N2jS7umujAIt1RWuNi/rrgBiDkF3qrkCAwEAATANBgkqhkiG9w0BAQUFAAOBgQAnnTicnJhJpAsQbv72/7VfqI5OdUt9YkSo0FKCcDPYCDeZ3AaVfDENMHBgOsiCd8KyZx8pTqF6SzelF5W7pl6TEWuhCDCC9hCs8ecgsY38ZdixTEacQYYStmYsQ/PS1/4/J/40Dum5T4c76kv8r/dd1IAHjPdiNalFWOtSSu4NVA=="
            }`
        )
    );

    const service = new CertificateService();
    return await service.get("bd7c0d29efad85c5174364c330db1698b14f7f55");
};

/**
 * Represents the entire application
 */
export const Application: React.FC = () => {
    const [theme, setTheme] = React.useState(defaultTheme);

    const [certificate, setCertificate] = React.useState<
        Certificate | undefined
    >(undefined);

    useAsyncEffect(async () => {
        const cert = (await getCert()) ?? undefined;
        setCertificate(cert);
    }, []);

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
                    onRenderLabel={() => {
                        return <></>;
                    }}
                    onChange={(_, option) => {
                        if (option) {
                            setTheme(String(option.key));
                        }
                    }}
                />
            </Header>
            <Main>
                <DisplayPane>
                    <CertificateDisplay certificate={certificate} />
                </DisplayPane>
            </Main>
            <Footer />
        </AppRoot>
    );
};
