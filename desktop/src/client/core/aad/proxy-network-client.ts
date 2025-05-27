import type { INetworkModule, NetworkRequestOptions, NetworkResponse } from "@azure/msal-node";
import * as HttpsProxyAgent from "https-proxy-agent";
import fetch from "node-fetch";

/**
 * Placeholder for msal-node's network module which uses node-fetch to support
 * HTTP proxy configurations with authorization
 *
 * @see https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/6527#issuecomment-2077953882
 */
export class ProxyNetworkClient implements INetworkModule {
    private proxyAgent: HttpsProxyAgent;
    constructor(proxyUrl: string) {
        this.proxyAgent = new HttpsProxyAgent(proxyUrl);
    }

    sendGetRequestAsync<T>(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
        return this.sendRequestAsync(url, "GET", options);
    }
    sendPostRequestAsync<T>(url: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
        return this.sendRequestAsync(url, "POST", options);
    }

    private async sendRequestAsync<T>(
        url: string,
        method: "GET" | "POST",
        options: NetworkRequestOptions = {},
    ): Promise<NetworkResponse<T>> {
        try {
            const requestOptions = {
                method: method,
                headers: options.headers,
                body: method === "POST" ? options.body : undefined,
                agent: this.proxyAgent,
            };

            const response = await fetch(url, requestOptions);
            const data = await response.json() as any;

            const headersObj: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headersObj[key] = value;
            });

            return {
                headers: headersObj,
                body: data,
                status: response.status,
            };
        } catch (err) {
            console.error("Proxy request error", err);
            throw err;
        }
    }
}
