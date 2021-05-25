import {
    CertificateListView,
    CertificateService,
    CertificateView,
} from "@batch/ui-service";
import { observer } from "mobx-react-lite";
import * as React from "react";
import { useAsyncEffect } from "../../hooks";
import { CertificateDisplay, DisplayPane } from "../display";
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
            <CertificateList
                view={certListView}
                onCertificateSelected={(_, index) => {
                    certListView.clearSelection();
                    certListView.selectByIndex(index);
                }}
            />
            <CertificateDisplay
                view={
                    new CertificateView(
                        certListView.firstSelection() ?? undefined
                    )
                }
            />
        </DisplayPane>
    );
});
