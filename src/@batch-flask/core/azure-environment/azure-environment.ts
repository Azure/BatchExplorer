export interface AzureEnvironmentAttributes {
    id: string;
    name: string;

    /**
     * Url used for authentication
     */
    aadUrl: string;

    /**
     * Arm endpoint
     */
    armUrl: string;

    /**
     * Url for the batch service
     */
    batchUrl: string;

    /**
     * Url for ms graph api
     */
    msGraph: string;

    /**
     * Url for aad graph api
     */
    aadGraph: string;

    /**
     * Application insights api
     */
    appInsights: string;

    /**
     * Azure storage endpoint
     */
    storageEndpoint: string;
}

// tslint:disable:variable-name
export class AzureEnvironment implements AzureEnvironmentAttributes {
    public static Azure = new AzureEnvironment({
        id: "Azure",
        name: "Azure Public(Default)",
        aadUrl: "https://login.microsoftonline.com/",
        armUrl: "https://management.azure.com/",
        batchUrl: "https://batch.core.windows.net/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.windows.net/",
        appInsights: "https://api.applicationinsights.io/",
        storageEndpoint: "core.windows.net",
    });

    public static AzureChina = new AzureEnvironment({
        id: "AzureChina",
        name: "Azure China",
        aadUrl: "https://login.chinacloudapi.cn/",
        armUrl: "https://management.chinacloudapi.cn/",
        batchUrl: "https://batch.chinacloudapi.cn/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.chinacloudapi.cn/",
        appInsights: "https://api.applicationinsights.io/",
        storageEndpoint: "core.chinacloudapi.cn",
    });

    public static AzureGermany = new AzureEnvironment({
        id: "AzureGermany",
        name: "Azure Germany",
        aadUrl: "https://login.microsoftonline.de/",
        armUrl: "https://management.microsoftazure.de/",
        batchUrl: "https://batch.microsoftazure.de/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.cloudapi.de/",
        appInsights: "https://api.applicationinsights.io/",
        storageEndpoint: "core.cloudapi.de",
    });

    public static AzureUSGov = new AzureEnvironment({
        id: "AzureUSGov",
        name: "Azure US Goverment",
        aadUrl: "https://login.microsoftonline.us/",
        armUrl: "https://management.usgovcloudapi.net/",
        batchUrl: "https://batch.core.usgovcloudapi.net/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.windows.net/",
        appInsights: "https://api.applicationinsights.io/",
        storageEndpoint: "core.usgovcloudapi.net",
    });

    public id: string;
    public name: string;
    public aadUrl: string;
    public armUrl: string;
    public batchUrl: string;
    public msGraph: string;
    public aadGraph: string;
    public appInsights: string;
    public storageEndpoint: string;

    constructor(attr: AzureEnvironmentAttributes) {
        Object.assign(this, attr);
    }
}

export const SupportedEnvironments = {
    [AzureEnvironment.Azure.id]: AzureEnvironment.Azure,
    [AzureEnvironment.AzureChina.id]: AzureEnvironment.AzureChina,
    [AzureEnvironment.AzureGermany.id]: AzureEnvironment.AzureGermany,
    [AzureEnvironment.AzureUSGov.id]: AzureEnvironment.AzureUSGov,
};
