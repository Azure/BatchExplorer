import { OperationOptions } from "../operations";
import { Pool, PoolOutput } from "./pool-models";

export interface PoolService {
    createOrUpdate(pool: Pool, opts?: OperationOptions): Promise<PoolOutput>;
    get(id: string, opts?: OperationOptions): Promise<PoolOutput | undefined>;
    listByAccountId(accountId: string): Promise<PoolOutput[]>;
    patch(pool: Pool, opts?: OperationOptions): Promise<PoolOutput>;
}
