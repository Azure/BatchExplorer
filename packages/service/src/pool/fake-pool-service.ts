import { BasicBatchFakeSet, BatchFakeSet } from "../test-util/fakes";
import type { Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";

export class FakePoolService implements PoolService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async createOrUpdate(
        poolResourceId: string,
        pool: Pool
    ): Promise<PoolOutput> {
        return this.fakeSet.putPool(pool);
    }

    async get(poolResourceId: string): Promise<PoolOutput | undefined> {
        return this.fakeSet.getPool(poolResourceId);
    }

    async listByAccountId(accountId: string): Promise<PoolOutput[]> {
        return this.fakeSet.listPoolsByAccount(accountId);
    }

    async patch(poolResourceId: string, pool: Pool): Promise<PoolOutput> {
        return this.fakeSet.patchPool(pool);
    }
}
