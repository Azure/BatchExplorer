import React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import {
    PropertyList,
    PropertyGroup,
    TextProperty,
    DateProperty,
} from "@azure/bonito-ui/lib/components";
import { VmExtItem } from "./vm-extension-list";
import { translate } from "@azure/bonito-core";
import { useAppTheme } from "@azure/bonito-ui/lib/theme";

export interface VmExtensionDetailsProps {
    vme?: VmExtItem;
}

export const VmExtensionDetails = (props: VmExtensionDetailsProps) => {
    const theme = useAppTheme();
    const { vme } = props;

    const latestStatus = React.useMemo(() => getLatestStatus(vme), [vme]);

    const titleStyle = React.useMemo(() => {
        return {
            color: theme.palette.black,
            fontSize: "14px",
            fontWeight: "600",
            marginTop: "0px",
        };
    }, [theme.palette.black]);

    const groupStyle = React.useMemo(() => {
        return {
            paddingBottom: "20px",
        };
    }, []);

    if (!vme) {
        return null;
    }
    return (
        <PropertyList>
            <PropertyGroup
                title={translate("lib.react.common.general")}
                enableCollapse={false}
                titleStyle={titleStyle}
                containerStyle={groupStyle}
            >
                <TextProperty
                    label={translate("lib.react.vmExtension.name")}
                    value={vme.name}
                    hideCopyButton={true}
                />
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
            {latestStatus && (
                <PropertyGroup
                    title={translate("lib.react.vmExtension.latestStatus")}
                    enableCollapse={false}
                    titleStyle={titleStyle}
                    containerStyle={groupStyle}
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
            {vme.settings && (
                <PropertyGroup
                    title={translate("lib.react.vmExtension.settings")}
                    enableCollapse={false}
                    titleStyle={titleStyle}
                    containerStyle={groupStyle}
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
        </PropertyList>
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
