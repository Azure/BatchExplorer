import { DataGrid } from "@azure/bonito-ui/lib/components";
import { Certificate, CertificateListView } from "@batch/ui-service";
import { observer } from "mobx-react-lite";
import * as React from "react";

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
                { prop: "thumbprintAlgorithm", label: "Algorithm" },
                { prop: "state", label: "State" },
                { prop: "stateTransitionTime", label: "Last Updated" },
            ]}
            items={view.items}
            hasMore={view.loading}
        />
    );
});
