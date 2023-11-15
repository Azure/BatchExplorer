import { OperationOptions } from "@azure/bonito-core";
import { Pool, PoolOutput } from "./pool-models";

export interface PoolService {
    createOrUpdate(
        batchAccountId: string,
        poolName: string,
        pool: Pool
    ): Promise<PoolOutput>;
    get(
        batchAccountId: string,
        poolName: string,
        opts?: OperationOptions
    ): Promise<PoolOutput | undefined>;
    listByAccountId(
        accountId: string,
        opts?: OperationOptions
    ): Promise<PoolOutput[]>;
    patch(
        batchAccountId: string,
        poolName: string,
        pool: Pool,
        opts?: OperationOptions
    ): Promise<PoolOutput>;
}
