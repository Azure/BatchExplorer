import * as React from "react";
//import { headingStyle } from "../../../style";
import { DemoPane } from "../../../layout/demo-pane";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { parseCertificateJson, certificateToJson } from "@batch/ui-service";

//import { CertificateView } from "@batch/ui-service";
import { Certificate } from "@batch/ui-service";
import { TextField, ITextFieldStyles } from "@fluentui/react/lib/TextField";

const testCert: Certificate = {
    thumbprint: "bd7c0d29efad85c5174364c330db1698b14f7f55",
    thumbprintAlgorithm: "sha1",
    url: "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)",
    state: "active",
    stateTransitionTime: new Date(),
    publicData: `MIICMTCCAZqgAwIBAgIQGroSHQekS6dHgBwHcOmihzANBgkqhkiG9w0BAQUFADBXMVUwUwYDVQQDHkwAewAxADAAQQBDADEAQQAzAEMALQBFADgAQgAwAC0ANABCADMANgAtADgAMAA0AEYALQBFADkARQBFAEEANwBGADQANgBEAEEAQQB9MB4XDTE2MDMwODAwMjcyM1oXDTE3MDMwODA2MjcyM1owVzFVMFMGA1UEAx5MAHsAMQAwAEEAQwAxAEEAMwBDAC0ARQA4AEIAMAAtADQAQgAzADYALQA4ADAANABGAC0ARQA5AEUARQBBADcARgA0ADYARABBAEEAfTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAvUBbyvBVcVfL3eGBUQDBi6+LNYz5YCyxXZD22b0jKBvjwyY6tzvFPW/dZsSJ9ruwkc5YX4O9iS366z9ot3ZDcXP1jievVmT+ljFpBScrNDtHtw4NGSBYbb4JGqHPpvUMNbLDc+0pOBC2N2jS7umujAIt1RWuNi/rrgBiDkF3qrkCAwEAATANBgkqhkiG9w0BAQUFAAOBgQAnnTicnJhJpAsQbv72/7VfqI5OdUt9YkSo0FKCcDPYCDeZ3AaVfDENMHBgOsiCd8KyZx8pTqF6SzelF5W7pl6TEWuhCDCC9hCs8ecgsY38ZdixTEacQYYStmYsQ/PS1/4/J/40Dum5T4c76kv8r/dd1IAHjPdiNalFWOtSSu4NVA==`,
};

const valueString: string = certificateToJson(testCert);

export const ConfigurationDemo: React.FC = (props) => {
    const [theThumbprint, setTheThumbprint] = React.useState<
        string | undefined
    >("bd7c0d29efad85c5174364c330db1698b14f7f55");

    //console.log("value");

    //const certificateView = new CertificateView(testCert);
    //const cert = certificateView.model;

    const jsonOnChange = React.useCallback((value: string) => {
        const obj: Certificate = parseCertificateJson(value);

        setTheThumbprint(obj.thumbprint);
        //console.warn(obj.thumbprint);
    }, []);

    const textFieldStyles: Partial<ITextFieldStyles> = {
        root: { backgroundColor: "#000000", color: "#000000" },
    };

    return (
        <DemoPane title="Configuration">
            <TextField
                label=""
                value={theThumbprint}
                readOnly
                styles={textFieldStyles}
            />

            <MonacoEditor
                value={valueString}
                onChange={jsonOnChange}
                onChangeDelay={20}
                language="json"
                containerStyle={{
                    width: "80%",
                    height: "100%",
                }}
                editorOptions={{
                    minimap: {
                        enabled: false,
                    },
                }}
            />
        </DemoPane>
    );
};
