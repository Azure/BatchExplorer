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
}

// tslint:disable:variable-name
export class AzureEnvironment implements AzureEnvironmentAttributes {
    public static Azure = new AzureEnvironment({
        id: "Azure",
        name: "Azure",
        aadUrl: "https://login.microsoftonline.com/",
        armUrl: "https://management.azure.com/",
        batchUrl: "https://batch.core.windows.net/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.windows.net/",
        appInsights: "https://api.applicationinsights.io/",
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
    });

    public id: string;
    public name: string;
    public aadUrl: string;
    public armUrl: string;
    public batchUrl: string;
    public msGraph: string;
    public aadGraph: string;
    public appInsights: string;

    constructor(attr: AzureEnvironmentAttributes) {
        Object.assign(this, attr);
    }
}

export const SupportedEnvironments = {
    [AzureEnvironment.Azure.id]: AzureEnvironment.Azure,
    [AzureEnvironment.AzureChina.id]: AzureEnvironment.AzureChina,
};
