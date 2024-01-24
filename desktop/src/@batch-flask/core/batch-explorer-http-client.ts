import { AbstractHttpClient, FetchHttpClient, HttpRequestInit, UrlOrRequestInit } from "@azure/bonito-core";
import { TenantPlaceholders } from "client/core/aad/aad-constants";
import { AuthService } from "../../app/services";
import { AccessToken } from "./aad";

export default class BatchExplorerHttpClient extends AbstractHttpClient {
    private _delegate: FetchHttpClient;

    constructor(
        private authService: AuthService,
        fetchHttpClient?: FetchHttpClient
    ) {
        super();
        this._delegate = fetchHttpClient ?? new FetchHttpClient();
    }

    public async fetch(
        urlOrRequest: UrlOrRequestInit,
        requestProps?: HttpRequestInit
    ): Promise<Response> {

        // TODO: Tenant ID should be retrieved from a global context (e.g.,
        // tenant picker or directory service)
        const tenantId = TenantPlaceholders.common;

        const accessToken: AccessToken =
            await this.authService.getAccessToken(tenantId);


        const headers: Headers = new Headers();
        if (requestProps?.headers) {
            if (typeof requestProps.headers.forEach === "function") {
                // Headers object
                requestProps.headers.forEach((value, key) => {
                    headers.set(key, value);
                });
            } else {
                // Map of headers
                const headerMap = requestProps.headers as Record<string, string>;
                for (const [k, v] of Object.entries(headerMap)) {
                    headers.set(k, v);
                }
            }
        }
        headers.set("Authorization", `${accessToken.tokenType} ${accessToken.accessToken}`);
        return this._delegate.fetch(urlOrRequest, {
            ...requestProps,
            headers,
        });
    }
}
