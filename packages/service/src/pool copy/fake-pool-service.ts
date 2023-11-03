import { BasicBatchFakeSet, BatchFakeSet } from "../test-util/fakes";
import type { Pool, PoolOutput } from "./node-models";
import type { PoolService } from "./node-service";

export class FakePoolService implements PoolService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async createOrUpdate(pool: Pool): Promise<PoolOutput> {
        return this.fakeSet.putPool(pool);
    }

    async get(id: string): Promise<PoolOutput | undefined> {
        return this.fakeSet.getPool(id);
    }

    async listByAccountId(accountId: string): Promise<PoolOutput[]> {
        return this.fakeSet.listPoolsByAccount(accountId);
    }

    async patch(pool: Pool): Promise<PoolOutput> {
        return this.fakeSet.patchPool(pool);
    }
}
