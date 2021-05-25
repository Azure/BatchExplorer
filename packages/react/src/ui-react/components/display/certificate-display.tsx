import { CertificateView } from "@batch/ui-service";
import { Stack } from "@fluentui/react/lib/Stack";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { ActionBar } from "../action/action-bar";
import { CertificatePropertyList } from "../certificate/certificate-property-list";

export interface CertificateDisplayProps {
    view?: CertificateView;
}

export const CertificateDisplay = observer((props: CertificateDisplayProps) => {
    if (!props.view || !props.view.model) {
        return <div>No certificate found</div>;
    }

    const cert = props.view.model;
    return (
        <Stack tokens={{ childrenGap: 16 }}>
            <ActionBar
                items={[{ text: "Action One" }, { text: "Action Two" }]}
            />
            <CertificatePropertyList view={new CertificateView(cert)} />
        </Stack>
    );
});
