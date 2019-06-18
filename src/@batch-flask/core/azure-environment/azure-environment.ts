export interface AADResources {
    /**
     * Arm endpoint
     */
    readonly arm: string;

    /**
     * Url for the batch service
     */
    readonly batch: string;

    /**
     * Url for ms graph api
     */
    readonly msGraph: string;

    /**
     * Url for aad graph api
     */
    readonly aadGraph: string;

    /**
     * Application insights api
     */
    readonly appInsights: string;
}

export type AADResourceName = keyof AADResources;

export interface AzureEnvironment extends AADResources {
    readonly id: string;
    readonly name: string;

    /**
     * Url used for authentication
     */
    readonly aadUrl: string;

    /**
     * Azure storage endpoint
     */
    readonly storageEndpoint: string;

    /**
     * If the environment is coming from a user.
     */
    readonly custom: boolean;
}

// tslint:disable: variable-name
export const AzurePublic: AzureEnvironment = {
    id: "Azure",
    name: "Azure Public(Default)",
    aadUrl: "https://login.microsoftonline.com/",
    arm: "https://management.azure.com/",
    batch: "https://batch.core.windows.net/",
    msGraph: "https://graph.microsoft.com/",
    aadGraph: "https://graph.windows.net/",
    appInsights: "https://api.applicationinsights.io/",
    storageEndpoint: "core.windows.net",
    custom: false,
};

const azureChina: AzureEnvironment = {
    id: "AzureChina",
    name: "Azure China",
    aadUrl: "https://login.chinacloudapi.cn/",
    arm: "https://management.chinacloudapi.cn/",
    batch: "https://batch.chinacloudapi.cn/",
    msGraph: "https://graph.microsoft.com/",
    aadGraph: "https://graph.chinacloudapi.cn/",
    appInsights: "https://api.applicationinsights.io/",
    storageEndpoint: "core.chinacloudapi.cn",
    custom: false,
};

const azureGermany: AzureEnvironment = {
    id: "AzureGermany",
    name: "Azure Germany",
    aadUrl: "https://login.microsoftonline.de/",
    arm: "https://management.microsoftazure.de/",
    batch: "https://batch.microsoftazure.de/",
    msGraph: "https://graph.microsoft.com/",
    aadGraph: "https://graph.cloudapi.de/",
    appInsights: "https://api.applicationinsights.io/",
    storageEndpoint: "core.cloudapi.de",
    custom: false,
};

const azureUSGov: AzureEnvironment = {
    id: "AzureUSGov",
    name: "Azure US Goverment",
    aadUrl: "https://login.microsoftonline.us/",
    arm: "https://management.usgovcloudapi.net/",
    batch: "https://batch.core.usgovcloudapi.net/",
    msGraph: "https://graph.microsoft.com/",
    aadGraph: "https://graph.windows.net/",
    appInsights: "https://api.applicationinsights.io/",
    storageEndpoint: "core.usgovcloudapi.net",
    custom: false,
};

export const SupportedEnvironments = {
    [AzurePublic.id]: AzurePublic,
    [azureChina.id]: azureChina,
    [azureGermany.id]: azureGermany,
    [azureUSGov.id]: azureUSGov,
};
