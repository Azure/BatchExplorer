// import { initBladeEnvironment } from "../BladeEnvironment";
import * as React from "react";
import { BatchModels } from "@batch/ui-service";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import {
    getEnableAutomaticUpgradeValue,
    VmExtensionDetailsPanel,
} from "./vm-extension-details";
import { Link } from "@fluentui/react/lib/Link";
import { translate } from "@azure/bonito-core";

export type VmExtItem = BatchModels.VMExtensionOutput & {
    provisioningState?: string;
    instanceView?: BatchModels.VMExtensionInstanceViewOutput;
};

interface VmExtensionListProps {
    loading: boolean;
    extensions: VmExtItem[];
}

export const VmExtensionList = (props: VmExtensionListProps) => {
    const { extensions, loading } = props;

    const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
    const [selectedExtension, setSelectedExtension] =
        React.useState<VmExtItem>();

    const hasProvisioningState = React.useMemo<boolean>(() => {
        return extensions.some((ext) => {
            return ext?.provisioningState !== undefined;
        });
    }, [extensions]);

    const columns = React.useMemo<DataGridColumn[]>(() => {
        const cols = [
            {
                label: translate("lib.react.vmExtension.name"),
                prop: "name",
                minWidth: 200,
                onRender: (item: VmExtItem) => {
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
                label: translate("lib.react.vmExtension.type"),
                prop: "type",
                minWidth: 200,
            },
            {
                label: translate("lib.react.vmExtension.version"),
                prop: "typeHandlerVersion",
            },
            {
                label: translate("lib.react.vmExtension.enableAutoUpdate"),
                prop: "enableAutomaticUpgrade",
                minWidth: 200,
                onRender: (item: VmExtItem) => {
                    return getEnableAutomaticUpgradeValue(item);
                },
            },
        ];
        if (hasProvisioningState) {
            cols.splice(cols.findIndex((c) => c.prop === "type") + 1, 0, {
                label: translate("lib.react.vmExtension.provisioningState"),
                prop: "provisioningState",
                minWidth: 200,
            });
        }
        return cols;
    }, [hasProvisioningState]);

    return (
        <>
            <DataGrid
                selectionMode="none"
                columns={columns}
                items={extensions}
                noResultText={translate("lib.react.vmExtension.noResult")}
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
