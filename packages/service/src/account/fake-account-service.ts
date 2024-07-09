import { OperationOptions } from "@azure/bonito-core";
import { BatchAccountOutput } from "../arm-batch-models";
import { AccountService } from "./account-service";
import { BatchFakeSet, BasicBatchFakeSet } from "../test-util/fakes";

export class FakeAccountService implements AccountService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async get(
        accountResouceId: string,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput | undefined> {
        return this.fakeSet.getBatchAccount(accountResouceId);
    }
}
