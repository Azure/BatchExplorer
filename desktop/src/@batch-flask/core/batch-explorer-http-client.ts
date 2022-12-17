import { AbstractHttpClient, FetchHttpClient, HttpRequestInit, UrlOrRequestInit } from "@batch/ui-common/lib-cjs/http";
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
        const authRequestProps = {...requestProps};
        if (!authRequestProps.headers) {
            authRequestProps.headers = {};
        }
        authRequestProps.headers["Authorization"] =
            `${accessToken.tokenType} ${accessToken.accessToken}`;
        return this._delegate.fetch(urlOrRequest, authRequestProps);
    }
}
