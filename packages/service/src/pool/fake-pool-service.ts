import { BasicBatchFakeSet, BatchFakeSet } from "../test-util/fakes";
import type { Pool, PoolOutput } from "./pool-models";
import type { PoolService } from "./pool-service";

export class FakePoolService implements PoolService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async createOrUpdate(poolArmId: string, pool: Pool): Promise<PoolOutput> {
        return this.fakeSet.putPool(pool);
    }

    async get(poolArmId: string): Promise<PoolOutput | undefined> {
        return this.fakeSet.getPool(poolArmId);
    }

    async listByAccountId(accountId: string): Promise<PoolOutput[]> {
        return this.fakeSet.listPoolsByAccount(accountId);
    }

    async patch(poolArmId: string, pool: Pool): Promise<PoolOutput> {
        return this.fakeSet.patchPool(pool);
    }
}
