import { BasicBatchFakeSet, BatchFakeSet } from "../test-util/fakes";
import type { Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";

export class FakePoolService implements PoolService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async createOrUpdate(
        batchAccountId: string,
        poolName: string,
        pool: Pool
    ): Promise<PoolOutput> {
        return this.fakeSet.putPool(pool);
    }

    async get(
        batchAccountId: string,
        poolName: string
    ): Promise<PoolOutput | undefined> {
        const id = `${batchAccountId}/pools/${poolName}`;
        return this.fakeSet.getPool(id);
    }

    async listByAccountId(accountId: string): Promise<PoolOutput[]> {
        return this.fakeSet.listPoolsByAccount(accountId);
    }

    async patch(
        batchAccountId: string,
        poolName: string,
        pool: Pool
    ): Promise<PoolOutput> {
        return this.fakeSet.patchPool(pool);
    }
}
