import { AbstractHttpService } from "../http-service";
import { BatchAccountOutput } from "@batch/arm-batch-rest/lib/generated";
import { BatchManagementServiceClient } from "@batch/arm-batch-rest/lib/batch-management-client";
import { isUnexpected } from "@batch/arm-batch-rest/lib/generated";

export class AccountService extends AbstractHttpService {
    async get(resourceId: string): Promise<BatchAccountOutput> {
        //Define singleton for Batch Management Client
        const batchArmClient = new BatchManagementServiceClient();

        const accountResponse = await batchArmClient.getAccountById(resourceId);

        if (isUnexpected(accountResponse)) {
            // TODO: Add better/more standardized error handling.
            //       This throws away the actual error info.
            throw new Error(
                `Unexpected status code ${accountResponse.status} while getting account. Response body: ${accountResponse.body}`
            );
        }

        return accountResponse.body;
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
        const batchArmClient = new BatchManagementServiceClient();

        const listResponse = await batchArmClient.listAccountsBySubscription(
            subscriptionId
        );

        if (isUnexpected(listResponse)) {
            // TODO: Add better/more standardized error handling.
            //       This throws away the actual error info.
            throw new Error(
                `Unexpected status code ${
                    listResponse.status
                } while getting account list. Response body: ${JSON.stringify(
                    listResponse.body
                )}`
            );
        }

        // TODO: Should return a list result object which has a method for
        //       getting more results
        return listResponse.body.value ?? [];
    }
}
