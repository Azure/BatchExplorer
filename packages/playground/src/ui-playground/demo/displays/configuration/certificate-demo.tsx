import * as React from "react";
import { DemoPane } from "../../../layout/demo-pane";
import { MonacoEditor } from "@batch/ui-react/lib/components";
import { parseCertificateJson, certificateToJson } from "@batch/ui-service";
import { CertificateView } from "@batch/ui-service";
import { CertificateDisplay } from "@batch/ui-react/lib/components";
import { Certificate } from "@batch/ui-service";
import { HeightAndWidth } from "../../../functions";
import { Label } from "@fluentui/react/lib/Label";
import { ILabelStyles } from "@fluentui/react/lib/";

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

export const CertificateDemo: React.FC = (props) => {
    let obj: Certificate = testCert;

    const [myCert, setMyCert] = React.useState<Certificate>(obj);

    const [theLabel, setTheLabel] = React.useState<string | undefined>("");

    const [theStateTransitionTime, setTheStateTransitionTime] = React.useState<
        string | undefined
    >("");

    const [thePreviousStateTransitionTime, setThePreviousStateTransitionTime] =
        React.useState<string | undefined>("");

    const [theState, setTheState] = React.useState<string | undefined>("");

    const [thePreviousState, setThePreviousState] = React.useState<
        string | undefined
    >("");

    const jsonOnChange = React.useCallback((value: string) => {
        try {
            obj = parseCertificateJson(value);
            setTheLabel("");
        } catch (e) {
            obj = testCert;
            setTheLabel("ERROR: JSON is formatted incorrectly.");
        }

        CheckInvalidDate(
            obj.stateTransitionTime?.toString(),
            setTheStateTransitionTime,
            false
        );

        CheckInvalidDate(
            obj.previousStateTransitionTime?.toString(),
            setThePreviousStateTransitionTime,
            true
        );

        CheckCertObjectState(obj.state, setTheState, false);

        CheckCertObjectState(obj.previousState, setThePreviousState, true);

        setMyCert(obj);
    }, []);

    /**
     * Checks whether a user-entered state transition time is valid and displays error message accordingly
     *
     * @param timeString The state transition time
     *
     * @param setLabel Syncs the changed state transition time with a label
     *
     * @param isPrevious Whether the passed in transition time is a previous or current transition time
     *
     * @returns void
     */
    function CheckInvalidDate(
        timeString: string | undefined,
        setLabel: React.Dispatch<React.SetStateAction<string | undefined>>,
        isPrevious: boolean
    ) {
        if (timeString == "Invalid Date") {
            if (isPrevious) {
                setLabel("ERROR: Previous State Transition Time is invalid");
            } else {
                setLabel("ERROR: State Transition Time is invalid");
            }
        } else {
            setLabel("");
        }
    }

    /**
     * Checks whether a user-entered certificate state is valid and displays error message accordingly
     *
     * @param certObjectState The certificate object state to check
     *
     * @param setState The variable that syncs the changed certificate object state with a label
     *
     * @param isPrevious Whether the passed in state is a previous or current state
     *
     * @returns void
     */
    function CheckCertObjectState(
        certObjectState: string | undefined,
        setState: React.Dispatch<React.SetStateAction<string | undefined>>,
        isPrevious: boolean
    ) {
        if (
            certObjectState != "active" &&
            certObjectState != "deletefailed" &&
            certObjectState != "deleting" &&
            certObjectState != "-"
        ) {
            if (isPrevious) {
                setState(
                    "ERROR: Previous State must be active, deletefailed, deleting, or empty (-)"
                );
            } else {
                setState(
                    "ERROR: State must be active, deletefailed, deleting, or empty (-)"
                );
            }
        } else {
            setState("");
        }
    }

    const labelStyles: ILabelStyles = {
        root: {
            color: "red",
            display: "flex",
            justifyContent: "center",
            align: "center",
        },
    };

    return (
        <DemoPane title="Certificate">
            <CertificateDisplay view={new CertificateView(myCert)} />

            <br></br>

            <Label styles={labelStyles}>{theLabel}</Label>

            <Label styles={labelStyles}>{theStateTransitionTime}</Label>

            <Label styles={labelStyles}>{thePreviousStateTransitionTime}</Label>

            <Label styles={labelStyles}>{theState}</Label>

            <Label styles={labelStyles}>{thePreviousState}</Label>

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: HeightAndWidth()[0] / 3, //500
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
