import { ArmBatchModels } from "@batch/ui-service";
import React from "react";
import { TextField } from "@fluentui/react/lib/TextField";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import {
    PropertyList,
    PropertyGroup,
    TextProperty,
} from "@azure/bonito-ui/lib/components";

interface VmExtensionDetailsProps {
    vme: ArmBatchModels.VMExtension | null;
}

export const VmExtensionDetails = (props: VmExtensionDetailsProps) => {
    const { vme } = props;

    if (!vme) {
        return null;
    }

    const fields = [
        {
            label: "Type",
            value: vme.type,
        },
        {
            label: "Version",
            value: vme.typeHandlerVersion,
        },
        {
            label: "Publisher",
            value: vme.publisher,
        },
        {
            label: "Enable automatic upgrade",
            value: vme.enableAutomaticUpgrade ? "Yes" : "No",
        },
        {
            label: "settings",
            value: (
                <TextField
                    autoAdjustHeight
                    multiline
                    contentEditable={false}
                    value={JSON.stringify(vme.settings, null, 4)}
                    resizable={false}
                ></TextField>
            ),
        },
    ];

    // render all properties
    return (
        <div style={{ paddingTop: "20px" }}>
            {fields.map((field) => (
                <div key={field.label} style={{ paddingBottom: "15px" }}>
                    <div style={{ marginBottom: "4px" }}>{field.label}</div>
                    <div>{field.value}</div>
                </div>
            ))}
        </div>
    );
};

export const VmExtensionDetails2 = (props: VmExtensionDetailsProps) => {
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
                <TextProperty
                    label="Enable automatic upgrade"
                    value={vme.enableAutomaticUpgrade ? "Yes" : "No"}
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
            <VmExtensionDetails2 vme={vme} />
        </Panel>
    );
};
