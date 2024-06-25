import { OperationOptions } from "@azure/bonito-core";
import { BatchAccountOutput } from "../arm-batch-models";

export interface AccountService {
    get(
        accountResouceId: string,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput | undefined>;
}
