import { OperationOptions } from "@azure/bonito-core";
import {
    AccountBatchUpdateParameters,
    BatchAccountOutput,
    NetworkSecurityPerimeterConfigurationListResultOutput,
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

    /**
     * list the network security perimeter configuration of a batch account
     * @param accountResouceId The resource id of the account
     * @param opts
     */
    listNetworkSecurityPerimeterConfigurations(
        accountResouceId: string,
        opts?: OperationOptions
    ): Promise<NetworkSecurityPerimeterConfigurationListResultOutput>;
}
