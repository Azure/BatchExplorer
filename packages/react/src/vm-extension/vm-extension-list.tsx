// import { initBladeEnvironment } from "../BladeEnvironment";
import * as React from "react";
import {
    VMExtensionOutput,
    VMExtensionInstanceViewOutput,
} from "@batch/ui-service/lib/batch-models";
import {
    DataGrid,
    DataGridColumn,
} from "@azure/bonito-ui/lib/components/data-grid";
import { getEnableAutomaticUpgradeValue } from "./vm-extension-details";
import { Link } from "@fluentui/react/lib/Link";
import { translate } from "@azure/bonito-core";
import { SearchBox } from "@fluentui/react/lib/SearchBox";

export type VmExtItem = VMExtensionOutput & {
    provisioningState?: string;
    instanceView?: VMExtensionInstanceViewOutput;
};

interface VmExtensionListProps {
    loading: boolean;
    extensions: VmExtItem[];
    onItemClick?: (item: VmExtItem) => void;
}

export const VmExtensionList = (props: VmExtensionListProps) => {
    const { extensions, loading, onItemClick } = props;

    const hasProvisioningState = React.useMemo<boolean>(() => {
        return extensions.some((ext) => {
            return ext?.provisioningState !== undefined;
        });
    }, [extensions]);

    const [filterValue, setFilterValue] = React.useState<string>("");

    const displayedExtensions = React.useMemo<VmExtItem[]>(() => {
        if (!filterValue) {
            return extensions;
        }
        const lowerFilter = filterValue.toLowerCase();
        return extensions.filter((ext) => {
            return (
                ext.name.toLowerCase().includes(lowerFilter) ||
                ext.type.toLowerCase().includes(lowerFilter) ||
                ext.typeHandlerVersion?.toLowerCase().includes(lowerFilter) ||
                ext.provisioningState?.toLowerCase().includes(lowerFilter)
            );
        });
    }, [extensions, filterValue]);

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
                                onItemClick?.(item);
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
                label: translate("lib.react.vmExtension.autoUpdate"),
                prop: "enableAutomaticUpgrade",
                minWidth: 160,
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
    }, [hasProvisioningState, onItemClick]);

    return (
        <>
            <SearchBox
                styles={{
                    root: {
                        width: "210px",
                    },
                }}
                value={filterValue}
                onChange={(_, value) => {
                    setFilterValue(value || "");
                }}
                placeholder={translate("lib.react.vmExtension.search")}
            />
            <DataGrid
                selectionMode="none"
                compact
                columns={columns}
                items={displayedExtensions}
                noResultText={translate("lib.react.vmExtension.noResult")}
                hasMore={loading}
            />
        </>
    );
};
