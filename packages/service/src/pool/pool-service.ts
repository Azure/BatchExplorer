import { OperationOptions } from "@azure/bonito-core";
import { Pool, PoolOutput } from "./pool-models";

export interface PoolService {
    createOrUpdate(poolResourceId: string, pool: Pool): Promise<PoolOutput>;
    get(
        poolResourceId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined>;
    listByAccountId(
        accountId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput[]>;
    patch(
        poolResourceId: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput>;
}
