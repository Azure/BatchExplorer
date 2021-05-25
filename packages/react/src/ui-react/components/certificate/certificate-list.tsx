import { Certificate, CertificateListView } from "@batch/ui-service";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { DataGrid } from "../data-grid";

export interface CertificateListProps {
    view: CertificateListView;
    onCertificateSelected?: (selected: Certificate, index: number) => void;
}

export const CertificateList = observer((props: CertificateListProps) => {
    const { view } = props;
    return (
        <DataGrid
            onActiveItemChanged={(_, index) => {
                index != null &&
                    props.onCertificateSelected &&
                    props.onCertificateSelected(view.items[index], index);
            }}
            columns={[
                { fieldName: "thumbprint" },
                { fieldName: "thumbprintAlgorithm" },
                { fieldName: "state" },
                { fieldName: "stateTransitionTime" },
            ]}
            items={view.items}
        />
    );
});
