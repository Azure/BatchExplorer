// import { initBladeEnvironment } from "../BladeEnvironment";
import * as React from "react";
import { ArmBatchModels } from "@batch/ui-service";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { VmExtensionDetailsPanel } from "./vm-extension-details";
import { Link } from "@fluentui/react/lib/Link";

type VMExtension = ArmBatchModels.VMExtension;

interface VmExtensionListProps {
    loading: boolean;
    extensions: VMExtension[];
}

export const VmExtensionList = (props: VmExtensionListProps) => {
    const { extensions, loading } = props;

    const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
    const [selectedExtension, setSelectedExtension] =
        React.useState<VMExtension | null>(null);

    const columns = React.useMemo<DataGridColumn[]>(() => {
        return [
            {
                label: "Name",
                prop: "name",
                minWidth: 200,
                onRender: (item: VMExtension) => {
                    return (
                        <Link
                            onClick={() => {
                                setSelectedExtension(item);
                                setPanelOpen(true);
                            }}
                        >
                            {item.name}
                        </Link>
                    );
                },
            },
            {
                label: "Type",
                prop: "type",
                minWidth: 200,
            },
            {
                label: "Version",
                prop: "typeHandlerVersion",
            },
            {
                label: "Enable automatic upgrade",
                prop: "enableAutomaticUpgrade",
                minWidth: 200,
                onRender: (item: VMExtension) => {
                    return item.enableAutomaticUpgrade ? "Yes" : "No";
                },
            },
        ];
    }, []);

    return (
        <>
            <DataGrid
                selectionMode="none"
                columns={columns}
                items={extensions}
                noResultText="No extensions"
                hasMore={loading}
            />
            <VmExtensionDetailsPanel
                isOpen={panelOpen}
                vme={selectedExtension}
                onDismiss={() => setPanelOpen(false)}
            />
        </>
    );
};
