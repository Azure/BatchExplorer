import { CertificateListView, CertificateView } from "@batch/ui-service";
import * as React from "react";
import { observer } from "mobx-react-lite";
import { DataGrid } from "../data-grid";
import { IconButton } from "@fluentui/react/lib/Button";
import { Selection, SelectionMode } from "@fluentui/react/lib/selection";
import { Spinner } from "@fluentui/react/lib/Spinner";
import { IObservableArray } from "mobx";
import { IContextualMenuProps } from "@fluentui/react/lib/ContextualMenu";

export interface CertificateListProps {
    view: CertificateListView;
    onCertificateSelected?: (selected: CertificateView, index: number) => void;
}

/**
 * A tabular list of certificates
 */
export const CertificateList = observer((props: CertificateListProps) => {
    const { view } = props;

    const selection = React.useMemo(
        () =>
            new Selection<CertificateView>({
                items: view.items,
                getKey: (item) => {
                    return item.model?.thumbprint || "";
                },
                selectionMode: SelectionMode.single,
                onSelectionChanged: () => {
                    view.selectedItems =
                        selection.getSelection() as IObservableArray;
                },
            }),
        [view]
    );

    return (
        <DataGrid
            columnDefaultMaxWidth={200}
            columns={[
                {
                    prop: "model.thumbprint",
                    label: "Thumbprint",
                    maxWidth: 300,
                },
                { prop: "model.thumbprintAlgorithm", label: "Algorithm" },
                {
                    prop: "model.state",
                    label: "State",
                    onRender: (item: CertificateView) => {
                        const isDeleteing = item.model?.state === "deleting";

                        return (
                            <>
                                {isDeleteing ? (
                                    <Spinner
                                        styles={{
                                            root: {
                                                justifyContent: "flex-start",
                                            },
                                        }}
                                        label="deleting"
                                        labelPosition="right"
                                    />
                                ) : (
                                    item.model?.state
                                )}
                            </>
                        );
                    },
                },
                { prop: "model.stateTransitionTime", label: "Last Updated" },
                {
                    prop: "options",
                    label: "Options",
                    onRender: (item: CertificateView) => {
                        return <CertificateOptions cert={item} />;
                    },
                },
            ]}
            items={view.items}
            selection={selection}
        />
    );
});

const CertificateOptions: React.FC<{ cert: CertificateView }> = observer(
    (props) => {
        const { cert } = props;
        const menuProps: IContextualMenuProps = {
            items: [
                {
                    key: "Refresh",
                    text: "Refresh",
                    onClick: () => {
                        cert.refresh();
                    },
                    iconProps: { iconName: "Refresh" },
                    disabled: cert.isRefreshing,
                },
                {
                    key: "Delete",
                    text: "Delete",
                    onClick: () => {
                        cert.delete();
                    },
                    iconProps: { iconName: "Delete" },
                    disabled: cert.model?.state === "deleting",
                },
                {
                    key: "Reactivate",
                    text: "Reactivate",
                    iconProps: { iconName: "Redo" },
                    disabled: cert.model?.state !== "deletefailed",
                },
                {
                    key: "Export as JSON",
                    text: "Export as JSON",
                    iconProps: { iconName: "Download" },
                },
            ],
        };

        return (
            <IconButton
                menuProps={menuProps}
                iconProps={{ iconName: "More" }}
                title="More"
                ariaLabel="More"
            />
        );
    }
);
