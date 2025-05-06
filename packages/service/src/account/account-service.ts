import { OperationOptions } from "@azure/bonito-core";
import {
    AccountBatchUpdateParameters,
    BatchAccountOutput,
} from "../arm-batch-models";

export interface AccountService {
    /**
     * Get a batch account, returns undefined if not found
     * @param accountResouceId The resource id of the account
     * @param opts
     */
    get(
        accountResouceId: string,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput | undefined>;

    /**
     * Update a batch account, return undefined if not found
     * @param accountResouceId The resource id of the account
     * @param parameters The parameters to update the account with
     * @param opts
     */
    patch(
        accountResouceId: string,
        parameters: AccountBatchUpdateParameters,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput | undefined>;
}
