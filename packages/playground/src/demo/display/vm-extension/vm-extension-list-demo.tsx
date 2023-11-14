import React from "react";
import {
    VmExtensionList,
    VmExtItem,
} from "@batch/ui-react/lib/pool/vm-extension/vm-extension-list";
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
    },
];

export const VmExtensionListDemo: React.FC = () => {
    return (
        <DemoPane title="VM Extension List">
            <VmExtensionList extensions={extensions} loading={false} />
        </DemoPane>
    );
};
