import { VmExtItem } from "./vm-extension-list";

export const succeededExtItem: VmExtItem = {
    name: "SuccessExtension",
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
        name: "SuccessExtension",
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
};

export const failedExtItem: VmExtItem = {
    name: "FailedExtension",
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
        name: "FailedExtension",
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
};
export const noProvisioningStateExtItem: VmExtItem = {
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
};

export const allExtItems: VmExtItem[] = [
    succeededExtItem,
    failedExtItem,
    noProvisioningStateExtItem,
];
