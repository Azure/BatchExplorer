import { DisplayPane } from "@azure/bonito-ui/lib/components";
import { useAsyncEffect } from "@azure/bonito-ui/lib/hooks";
import {
    CertificateListView,
    CertificateService,
    CertificateView,
} from "@batch/ui-service";
import { Stack } from "@fluentui/react/lib/Stack";
import { observer } from "mobx-react-lite";
import * as React from "react";
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
