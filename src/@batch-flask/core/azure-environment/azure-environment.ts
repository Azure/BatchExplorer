export interface AzureEnvironmentAttributes {
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
        name: "Azure",
        aadUrl: "https://login.microsoftonline.com/",
        armUrl: "https://management.azure.com/",
        batchUrl: "https://batch.core.windows.net/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.windows.net/",
        appInsights: "https://api.applicationinsights.io/",
    });

    public static AzureChina = new AzureEnvironment({
        name: "Azure China",
        aadUrl: "https://login.chinacloudapi.cn/",
        armUrl: "https://management.chinacloudapi.cn/",
        batchUrl: "https://batch.chinacloudapi.cn/",
        msGraph: "https://graph.microsoft.com/",
        aadGraph: "https://graph.chinacloudapi.cn/",
        appInsights: "https://api.applicationinsights.io/",
    });

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
    Azure: AzureEnvironment.Azure,
    AzureChina: AzureEnvironment.AzureChina,
};
