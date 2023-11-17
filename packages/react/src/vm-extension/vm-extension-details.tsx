import React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import {
    PropertyList,
    PropertyGroup,
    TextProperty,
    DateProperty,
} from "@azure/bonito-ui/lib/components";
import { VmExtItem } from "./vm-extension-list";
import { translate } from "@azure/bonito-core";

interface VmExtensionDetailsProps {
    vme?: VmExtItem;
}

export const VmExtensionDetails = (props: VmExtensionDetailsProps) => {
    const { vme } = props;

    const latestStatus = React.useMemo(() => getLatestStatus(vme), [vme]);

    if (!vme) {
        return null;
    }
    return (
        <PropertyList>
            <PropertyGroup title={translate("lib.react.common.general")}>
                <TextProperty
                    label={translate("lib.react.vmExtension.type")}
                    value={vme.type}
                    hideCopyButton={true}
                />
                <TextProperty
                    label={translate("lib.react.vmExtension.version")}
                    value={vme.typeHandlerVersion}
                    hideCopyButton={true}
                />

                <TextProperty
                    label={translate("lib.react.vmExtension.publisher")}
                    value={vme.publisher}
                    hideCopyButton={true}
                />
                {vme.provisioningState && (
                    <TextProperty
                        label={translate(
                            "lib.react.vmExtension.provisioningState"
                        )}
                        value={vme.provisioningState}
                        hideCopyButton={true}
                    />
                )}
                <TextProperty
                    label={translate("lib.react.vmExtension.enableAutoUpdate")}
                    value={getEnableAutomaticUpgradeValue(vme)}
                    hideCopyButton={true}
                />
            </PropertyGroup>
            {vme.settings && (
                <PropertyGroup
                    title={translate("lib.react.vmExtension.settings")}
                >
                    <TextField
                        autoAdjustHeight
                        multiline
                        contentEditable={false}
                        value={JSON.stringify(vme.settings, null, 4)}
                        resizable={false}
                    ></TextField>
                </PropertyGroup>
            )}
            {latestStatus && (
                <PropertyGroup
                    title={translate("lib.react.vmExtension.latestStatus")}
                >
                    <TextProperty
                        label={translate("lib.react.vmExtension.status")}
                        value={latestStatus.displayStatus}
                        hideCopyButton={true}
                    />
                    <DateProperty
                        label={translate("lib.react.common.time")}
                        value={latestStatus.time}
                        hideCopyButton={true}
                    />
                    <TextProperty
                        label={translate("lib.react.common.message")}
                        value={latestStatus.message}
                        hideCopyButton={true}
                    />
                </PropertyGroup>
            )}
        </PropertyList>
    );
};

export const VmExtensionDetailsPanel = (
    props: VmExtensionDetailsProps & {
        isOpen: boolean;
        onDismiss: () => void;
    }
) => {
    const { vme, isOpen, onDismiss } = props;

    const shouldOpen = React.useMemo(() => {
        return Boolean(isOpen && vme);
    }, [isOpen, vme]);
    return (
        <Panel
            headerText={vme?.name}
            isOpen={shouldOpen}
            onDismiss={onDismiss}
            isBlocking={false}
            type={PanelType.custom}
            customWidth="650px"
        >
            <VmExtensionDetails vme={vme} />
        </Panel>
    );
};

export function getEnableAutomaticUpgradeValue(item: VmExtItem) {
    if (item.enableAutomaticUpgrade === undefined) {
        return "N/A";
    }
    return item.enableAutomaticUpgrade
        ? translate("lib.react.common.yes")
        : translate("lib.react.common.no");
}

export function getLatestStatus(vme?: VmExtItem) {
    if (!vme?.instanceView) {
        return null;
    }
    return vme.instanceView?.statuses
        ?.map((it) => {
            return {
                ...it,
                time: it.time ? new Date(it.time) : undefined,
            };
        })
        .sort((a, b) => {
            if (a.time && b.time) {
                return new Date(b.time).getTime() - new Date(a.time).getTime();
            }
            // If time is undefined, we want to put it at the top
            if (!a.time) {
                return -1;
            }
            return 1;
        })[0];
}
