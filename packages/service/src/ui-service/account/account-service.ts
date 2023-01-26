import { AbstractHttpService } from "../http-service";
import batchClient, {
    BatchAccountList200Response,
    BatchAccountOutput,
} from "@batch/arm-batch-rest/lib/generated";
import { BatchHttpClient } from "@batch/arm-batch-rest/lib/http/HttpClient";

export const defaultThumbprintAlgorithm = "sha1";

export class AccountService extends AbstractHttpService {
    async get(resourceId: string): Promise<BatchAccountOutput> {
        // TODO: Need a helper function to avoid `undefined as any`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const batchArmClient = batchClient(undefined as any, {
            httpClient: new BatchHttpClient(),
        });

        // TODO: Need either a helper function for decomposing specific resource
        //       IDs into their parts, or our client should have a helper function
        //       such as `batchArmClient.getAccountById(resourceId)`
        const resourceParts = resourceId.split("/");

        const response = await batchArmClient
            .path(
                "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Batch/batchAccounts/{accountName}",
                resourceParts[2],
                resourceParts[4],
                resourceParts[8]
            )
            .get();

        if (response.status !== "200") {
            // TODO: Add better/more standardized error handling.
            //       This throws away the actual error info.
            throw new Error(
                `Unexpected status code ${response.status} while getting account. Response body: ${response.body}`
            );
        }

        // TODO: This cast should NOT be needed
        return response.body as BatchAccountOutput;
    }

    /**
     * List all Batch accounts in a given subscription
     * @param subscriptionId The subscription ID
     * @returns An account list result
     */
    async listBySubscription(
        subscriptionId: string
    ): Promise<BatchAccountOutput[]> {
        // TODO: Need a helper function to avoid `undefined as any`
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const batchArmClient = batchClient(undefined as any);

        const response = await batchArmClient
            .path(
                "/subscriptions/{subscriptionId}/providers/Microsoft.Batch/batchAccounts",
                subscriptionId
            )
            .get();

        if (response.status !== "200") {
            // TODO: Add better/more standardized error handling.
            //       This throws away the actual error info.
            throw new Error(
                `Unexpected status code ${
                    response.status
                } while getting account list. Response body: ${JSON.stringify(
                    response.body
                )}`
            );
        }

        // TODO: This cast should NOT be needed
        const listResponse = response as BatchAccountList200Response;

        // TODO: Should return a list result object which has a method for
        //       getting more results
        return listResponse.body.value ?? [];
    }
}
