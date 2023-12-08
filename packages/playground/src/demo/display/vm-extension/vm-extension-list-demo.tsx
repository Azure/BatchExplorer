import React from "react";
import {
    VmExtensionList,
    VmExtItem,
} from "@batch/ui-react/lib/vm-extension/vm-extension-list";
import { DemoPane } from "../../../layout/demo-pane";
import { VmExtensionDetailsPanel } from "@batch/ui-react";

const extensions: VmExtItem[] = [
    {
        name: "CustomExtension100",
        publisher: "Microsoft.Azure.Geneva",
        type: "GenevaMonitoring",
        typeHandlerVersion: "2.0",
        autoUpgradeMinorVersion: true,
        enableAutomaticUpgrade: true,
        settings: {
            applicationId: "settings1",
            version: "3.3.3",
            version1: "3.3.4",
            version2: "3.3.5",
            version3: "3.3.6",
        },
        provisioningState: "Succeeded",
        instanceView: {
            name: "CustomExtension100",
            statuses: [
                {
                    code: "ProvisioningState/succeeded",
                    level: "Info",
                    displayStatus: "Provisioning succeeded",
                    message: "Provisioning succeeded",
                    time: "2021-06-15T21:59:14.0000000Z",
                },
            ],
        },
    },
    {
        name: "batchextension1",
        publisher: "Microsoft.Azure.KeyVault",
        type: "KeyVaultForLinux",
        typeHandlerVersion: "2.0",
        autoUpgradeMinorVersion: true,
        enableAutomaticUpgrade: true,
        settings: {
            secretsManagementSettingsKey: "secretsManagementSettingsValue",
            authenticationSettingsKey: "authenticationSettingsValue",
        },
        provisionAfterExtensions: ["CustomExtension100"],
        provisioningState: "Failed",
        instanceView: {
            name: "batchextension1",
            statuses: [
                {
                    code: "ProvisioningState/failed",
                    level: "Error",
                    displayStatus: "Provisioning failed",
                    message: "Provisioning failed",
                    time: "2021-06-15T21:59:14.0000000Z",
                },
            ],
            subStatuses: [
                {
                    code: "ProvisioningState/failed",
                    level: "Error",
                    displayStatus: "Provisioning failed",
                    message: "Provisioning failed",
                    time: "2021-06-15T21:59:14.0000000Z",
                },
                {
                    code: "ProvisioningState/failed",
                    level: "Error",
                    displayStatus: "Provisioning failed",
                    message: "Provisioning failed",
                    time: "2021-06-15T21:59:14.0000000Z",
                },
            ],
        },
    },
    {
        name: "batchextension2",
        publisher: "Microsoft.Azure.KeyVault",
        type: "KeyVaultForLinux",
        typeHandlerVersion: "2.0",
        autoUpgradeMinorVersion: true,
        enableAutomaticUpgrade: false,
        settings: {},
        provisionAfterExtensions: ["CustomExtension100"],
        instanceView: {
            name: "batchextension1",
        },
    },
];

export const VmExtensionListDemo: React.FC = () => {
    const [panelOpen, setPanelOpen] = React.useState<boolean>(false);
    const [selectedExtension, setSelectedExtension] =
        React.useState<VmExtItem>();

    return (
        <DemoPane title="VM Extension List">
            <VmExtensionList
                extensions={extensions}
                loading={false}
                onItemClick={(item) => {
                    setSelectedExtension(item);
                    setPanelOpen(true);
                }}
            />
            <VmExtensionDetailsPanel
                isOpen={panelOpen}
                vme={selectedExtension}
                onDismiss={() => setPanelOpen(false)}
            />
        </DemoPane>
    );
};
