import {
    CertificateListView,
    CertificateService,
    CertificateView,
} from "@batch/ui-service";
import { observer } from "mobx-react-lite";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import * as React from "react";
import { useAsyncEffect } from "../../hooks";
import { DisplayPane } from "../layout/display-pane";
import { CertificateDisplay } from "./certificate-display";
import { CertificateList } from "./certificate-list";

/**
 * A list of certificates and a certificate display
 */
export const CertificatePage = observer(() => {
    const [certListView] = React.useState(
        new CertificateListView(new CertificateService())
    );

    useAsyncEffect(async () => {
        certListView;
        await certListView.load();
    }, [certListView]);

    return (
        <DisplayPane>
            <Stack tokens={{ childrenGap: 16 }}>
                <CertificateList
                    view={certListView}
                    onCertificateSelected={(_, index) => {
                        certListView.clearSelection();
                        certListView.selectByIndex(index);
                    }}
                />
                <div style={{ padding: "16px" }}>
                    <CertificateDisplay
                        view={
                            new CertificateView(
                                certListView.firstSelection() ?? undefined
                            )
                        }
                    />
                </div>
            </Stack>
        </DisplayPane>
    );
});
