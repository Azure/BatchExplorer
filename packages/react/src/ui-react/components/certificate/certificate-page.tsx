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
        await certListView.load();
    }, [certListView]);

    return (
        <Stack tokens={{ childrenGap: 16 }}>
            <CertificateList
                view={certListView}
                onCertificateSelected={(_, index) => {
                    certListView.clearSelection();
                    certListView.selectByIndex(index);
                }}
            />
            <DisplayPane
                title="Certificates"
                subtitle={certListView.batchAccount}
            >
                <CertificateDisplay
                    view={
                        new CertificateView(
                            certListView.firstSelection() ?? undefined
                        )
                    }
                />
            </DisplayPane>
        </Stack>
    );
});
