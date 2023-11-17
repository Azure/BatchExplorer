import React from "react";
import {
    VmExtensionList,
    VmExtItem,
} from "@batch/ui-react/lib/vm-extension/vm-extension-list";
import { DemoPane } from "../../../layout/demo-pane";

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
        },
    },
];

export const VmExtensionListDemo: React.FC = () => {
    return (
        <DemoPane title="VM Extension List">
            <VmExtensionList extensions={extensions} loading={false} />
        </DemoPane>
    );
};
