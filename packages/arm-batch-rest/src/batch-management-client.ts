import { TokenCredential } from "@azure/core-auth";
import { ClientOptions } from "@azure-rest/core-client";
import {
    BatchAccountGet200Response,
    BatchAccountGetDefaultResponse,
    BatchAccountList200Response,
    BatchAccountListDefaultResponse,
    BatchManagementClient,
} from "./generated";
import createClient from "./generated/batchManagementClient";
import { BatchHttpClient } from "./http/batch-http-client";

/**
 * Thin exportable wrapper around the Management Plane SDK Rest Level Client
 */
export class BatchManagementServiceClient {
    private readonly internalClient: BatchManagementClient;

    /**
     * @param options General Rest Level Client options
     * @param credential Auth Token Credential
     */
    constructor(options: ClientOptions = {}, credential?: TokenCredential) {
        if (!options.httpClient) {
            options = {
                ...options,
                httpClient: new BatchHttpClient(),
            };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const credentials = credential ?? (undefined as any);
        this.internalClient = createClient(credentials, options);
    }

    public async getAccountById(
        resourceId: string
    ): Promise<BatchAccountGet200Response | BatchAccountGetDefaultResponse> {
        // TODO: Need either a helper function for decomposing specific resource
        //       IDs into their parts, or our client should have a helper function
        //       such as `batchArmClient.getAccountById(resourceId)`
        const resourceParts = resourceId.split("/");

        const response = await this.internalClient
            .path(
                "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}",
                resourceParts[2],
                resourceParts[4],
                resourceParts[8]
            )
            .get();

        return response;
    }

    public async listAccountsBySubscription(
        subscriptionId: string
    ): Promise<BatchAccountList200Response | BatchAccountListDefaultResponse> {
        return await this.internalClient
            .path(
                "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/batchAccounts",
                subscriptionId
            )
            .get();
    }
}
