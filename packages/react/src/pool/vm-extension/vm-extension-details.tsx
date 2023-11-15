import React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import {
    PropertyList,
    PropertyGroup,
    TextProperty,
} from "@azure/bonito-ui/lib/components";
import { VmExtItem } from "./vm-extension-list";

interface VmExtensionDetailsProps {
    vme: VmExtItem | null;
}

export const VmExtensionDetails = (props: VmExtensionDetailsProps) => {
    const { vme } = props;

    if (!vme) {
        return null;
    }
    return (
        <PropertyList>
            <PropertyGroup title="General">
                <TextProperty label="Type" value={vme.type} />
                <TextProperty label="Version" value={vme.typeHandlerVersion} />

                <TextProperty label="Publisher" value={vme.publisher} />
                {vme.provisioningState && (
                    <TextProperty
                        label="Provisioning state"
                        value={vme.provisioningState}
                    />
                )}
                <TextProperty
                    label="Enable automatic upgrade"
                    value={getEnableAutomaticUpgradeValue(vme)}
                />
            </PropertyGroup>
            <PropertyGroup title="Settings">
                <TextField
                    autoAdjustHeight
                    multiline
                    contentEditable={false}
                    value={JSON.stringify(vme.settings, null, 4)}
                    resizable={false}
                ></TextField>
            </PropertyGroup>
            {vme.instanceView && (
                <PropertyGroup title="Instrance view">
                    <TextProperty label="Name" value={vme.instanceView.name} />
                    <TextProperty
                        label="Status"
                        value={vme.instanceView?.statuses?.[0]?.displayStatus}
                    />
                    <TextProperty
                        label="Status message"
                        value={vme.instanceView?.statuses?.[0]?.message}
                    />
                    <TextProperty
                        label="Status time"
                        value={vme.instanceView?.statuses?.[0]?.time}
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
    return item.enableAutomaticUpgrade ? "Yes" : "No";
}
