import { getSubscriptionIdFromUrl } from "@batch-flask/utils";
import { AbstractHttpClient, FetchHttpClient, HttpRequestInit, UrlOrRequestType } from "@batch/ui-common/lib-cjs/http";
import { TenantPlaceholders } from "client/core/aad/aad-constants";
import { AuthService, SubscriptionService } from "../../app/services";
import { AccessToken } from "./aad";

export default class BatchExplorerHttpClient extends AbstractHttpClient {
    private _delegate: FetchHttpClient;

    constructor(
        private authService: AuthService,
        private subscriptionService: SubscriptionService,
        fetchHttpClient?: FetchHttpClient
    ) {
        super();
        this._delegate = fetchHttpClient ?? new FetchHttpClient();
    }

    public async fetch(
        urlOrRequest: UrlOrRequestType,
        requestProps?: HttpRequestInit
    ): Promise<Response> {
        const tenantId = await this.getTenantIdFor(urlOrRequest);
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

    private getTenantIdFor(urlOrRequest: UrlOrRequestType): Promise<string> {
        const subscriptionId = getSubscriptionIdFromUrl(urlOrRequest);
        if (subscriptionId) {
            return new Promise((resolve) =>
                this.subscriptionService.get(subscriptionId)
                    .subscribe(subscription => resolve(subscription.tenantId))
            );
        } else {
            return Promise.resolve(TenantPlaceholders.common);
        }
    }
}
