import { OperationOptions } from "@azure/bonito-core";
import { BatchAccountOutput } from "../arm-batch-models";

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
}
