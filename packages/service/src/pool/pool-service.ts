import { OperationOptions } from "@azure/bonito-core";
import { Pool, PoolOutput } from "./pool-models";

export interface PoolService {
    createOrUpdate(poolArmId: string, pool: Pool): Promise<PoolOutput>;
    get(
        poolArmId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined>;
    listByAccountId(
        accountId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput[]>;
    patch(
        poolArmId: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput>;
}
