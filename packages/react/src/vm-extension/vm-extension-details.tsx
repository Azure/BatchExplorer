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

    const firstStatus = React.useMemo(() => getfirstStatus(vme), [vme]);
    const subStatues = vme?.instanceView?.subStatuses;
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
    // TODO: remove hideCopyButton when this is fixed:
    // https://msazure.visualstudio.com/One/_workitems/edit/25071199
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
                <TextProperty
                    label={translate("lib.react.vmExtension.autoUpdate")}
                    value={getEnableAutomaticUpgradeValue(vme)}
                    hideCopyButton={true}
                />
            </PropertyGroup>
            {firstStatus && (
                <PropertyGroup
                    title={translate("lib.react.vmExtension.status")}
                    enableCollapse={false}
                    titleStyle={titleStyle}
                    containerStyle={groupStyle}
                >
                    <TextProperty
                        label={translate("lib.react.vmExtension.status")}
                        value={firstStatus.displayStatus}
                        hideCopyButton={true}
                    />
                    <TextProperty
                        label={translate("lib.react.vmExtension.level")}
                        value={firstStatus.level}
                        hideCopyButton={true}
                    />
                    <TextProperty
                        label={translate("lib.react.common.message")}
                        value={firstStatus.message}
                        hideCopyButton={true}
                    />
                    <DateProperty
                        label={translate("lib.react.common.time")}
                        value={firstStatus.time}
                        hideCopyButton={true}
                    />
                    {subStatues && subStatues.length > 0 && (
                        <TextProperty
                            label={translate(
                                "lib.react.vmExtension.detailedStatus"
                            )}
                            value={JSON.stringify(subStatues, null, 4)}
                            hideCopyButton={true}
                            multiline
                        />
                    )}
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
                        ariaLabel={translate("lib.react.vmExtension.settings")}
                        readOnly
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
        ? translate("lib.react.common.enabled")
        : translate("lib.react.common.disabled");
}

export function getfirstStatus(vme?: VmExtItem) {
    if (!vme?.instanceView) {
        return null;
    }
    const firstStatus = vme.instanceView.statuses?.[0];
    if (!firstStatus) {
        return null;
    }
    return {
        ...firstStatus,
        time: firstStatus.time ? new Date(firstStatus.time) : undefined,
    };
}
