import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { parseCertificateJson, certificateToJson } from "@batch/ui-service";
import { CertificateView } from "@batch/ui-service";
import { CertificateDisplay } from "@batch/ui-react/lib/components";
import { Certificate } from "@batch/ui-service";
import { HeightAndWidth } from "../../../functions";
import { Label } from "@fluentui/react/lib/Label";
import { ILabelStyles } from "@fluentui/react/lib/Label";

const testCert: Certificate = {
    thumbprint: "bd7c0d29efad85c5174364c330db1698b14f7f55",
    thumbprintAlgorithm: "sha1",
    url: "https://prodtest1.brazilsouth.batch.azure.com/certificates(thumbprintAlgorithm=sha1,thumbprint=bd7c0d29efad85c5174364c330db1698b14f7f55)",
    state: "active",
    stateTransitionTime: new Date(),
    previousState: "active",
    previousStateTransitionTime: new Date(),
    publicData: `MIICMTCCAZqgAwIBAgIQGroSHQekS6dHgBwHcOmihzANBgkqhkiG9w0BAQUFADBXMVUwUwYDVQQDHkwAewAxADAAQQBDADEAQQAzAEMALQBFADgAQgAwAC0ANABCADMANgAtADgAMAA0AEYALQBFADkARQBFAEEANwBGADQANgBEAEEAQQB9MB4XDTE2MDMwODAwMjcyM1oXDTE3MDMwODA2MjcyM1owVzFVMFMGA1UEAx5MAHsAMQAwAEEAQwAxAEEAMwBDAC0ARQA4AEIAMAAtADQAQgAzADYALQA4ADAANABGAC0ARQA5AEUARQBBADcARgA0ADYARABBAEEAfTCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAvUBbyvBVcVfL3eGBUQDBi6+LNYz5YCyxXZD22b0jKBvjwyY6tzvFPW/dZsSJ9ruwkc5YX4O9iS366z9ot3ZDcXP1jievVmT+ljFpBScrNDtHtw4NGSBYbb4JGqHPpvUMNbLDc+0pOBC2N2jS7umujAIt1RWuNi/rrgBiDkF3qrkCAwEAATANBgkqhkiG9w0BAQUFAAOBgQAnnTicnJhJpAsQbv72/7VfqI5OdUt9YkSo0FKCcDPYCDeZ3AaVfDENMHBgOsiCd8KyZx8pTqF6SzelF5W7pl6TEWuhCDCC9hCs8ecgsY38ZdixTEacQYYStmYsQ/PS1/4/J/40Dum5T4c76kv8r/dd1IAHjPdiNalFWOtSSu4NVA==`,
};

const valueString: string = certificateToJson(testCert);

export const CertificateDemo: React.FC = () => {
    const obj = React.useRef(testCert);

    const [myCert, setMyCert] = React.useState<Certificate>(obj.current);

    const [theLabel, setTheLabel] = React.useState<string | undefined>("");

    const jsonOnChange = React.useCallback((value: string) => {
        try {
            obj.current = parseCertificateJson(value);
            setTheLabel("");
        } catch (e) {
            setTheLabel("ERROR: JSON is formatted incorrectly.");
        }

        setMyCert(obj.current);
    }, []);

    return (
        <DemoPane title="Certificate">
            <CertificateDisplay view={new CertificateView(myCert)} />

            <br></br>

            <Label styles={labelStyles}>{theLabel}</Label>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: HeightAndWidth()[0] / 3,
                    whiteSpace: "pre",
                }}
            >
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
            </div>
        </DemoPane>
    );
};

/*
 * Styles
 */
const labelStyles: ILabelStyles = {
    root: {
        color: "red",
        display: "flex",
        justifyContent: "center",
        align: "center",
    },
};
