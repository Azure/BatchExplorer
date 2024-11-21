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
import { Icon } from "@fluentui/react/lib/Icon";
import { useAppTheme } from "@azure/bonito-ui/lib/theme";

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
    const theme = useAppTheme();

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

    const columns = React.useMemo(() => {
        const cols: DataGridColumn<VmExtItem>[] = [
            {
                label: translate("lib.react.vmExtension.name"),
                prop: "name",
                minWidth: 200,
                onRender: (item) => {
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
                onRender: (item) => {
                    return getEnableAutomaticUpgradeValue(item);
                },
            },
        ];
        if (hasProvisioningState) {
            cols.splice(cols.findIndex((c) => c.prop === "type") + 1, 0, {
                label: translate("lib.react.vmExtension.provisioningState"),
                prop: "provisioningState",
                minWidth: 200,
                onRender: (item: VmExtItem) => {
                    const provisioningState = item.provisioningState;

                    const shouldDisplayIcon = ["Succeeded", "Failed"].includes(
                        provisioningState || ""
                    );
                    const iconName =
                        provisioningState === "Succeeded"
                            ? "SkypeCircleCheck"
                            : "StatusErrorFull";

                    const iconColor =
                        provisioningState === "Succeeded"
                            ? theme.semanticColors.successIcon
                            : theme.semanticColors.errorIcon;
                    return (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                            }}
                        >
                            {shouldDisplayIcon && (
                                <Icon
                                    iconName={iconName}
                                    style={{
                                        color: iconColor,
                                    }}
                                />
                            )}
                            {item.provisioningState}
                        </div>
                    );
                },
            });
        }
        return cols;
    }, [
        hasProvisioningState,
        onItemClick,
        theme.semanticColors.errorIcon,
        theme.semanticColors.successIcon,
    ]);

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
