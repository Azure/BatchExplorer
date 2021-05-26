import { Certificate, CertificateListView } from "@batch/ui-service";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { DataGrid } from "../data-grid";

export interface CertificateListProps {
    view: CertificateListView;
    onCertificateSelected?: (selected: Certificate, index: number) => void;
}

/**
 * A tabular list of certificates
 */
export const CertificateList = observer((props: CertificateListProps) => {
    const { view } = props;
    return (
        <DataGrid
            selectionMode="single"
            onActiveItemChanged={(_, index) => {
                index != null &&
                    props.onCertificateSelected &&
                    props.onCertificateSelected(view.items[index], index);
            }}
            columnDefaultMaxWidth={200}
            columns={[
                { prop: "thumbprint", label: "Thumbprint", maxWidth: 300 },
                { prop: "thumbprintAlgorithm", label: "Thumbprint Algorithm" },
                { prop: "state", label: "State" },
                { prop: "stateTransitionTime", label: "State Transition Time" },
            ]}
            items={view.items}
        />
    );
});
