import { OperationOptions } from "@azure/bonito-core";
import {
    AccountBatchUpdateParameters,
    BatchAccountOutput,
    NetworkSecurityPerimeterConfigurationListResultOutput,
} from "../arm-batch-models";
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
        const result = this.fakeSet.getBatchAccount(accountResouceId);
        return result;
    }

    async patch(
        accountResouceId: string,
        parameters: AccountBatchUpdateParameters,
        opts?: OperationOptions
    ): Promise<BatchAccountOutput | undefined> {
        const result = this.fakeSet.patchBatchAccount(
            accountResouceId,
            parameters
        );
        return result;
    }

    async listNetworkSecurityPerimeterConfigurations(
        accountResouceId: string,
        opts?: OperationOptions | undefined
    ): Promise<NetworkSecurityPerimeterConfigurationListResultOutput> {
        const result =
            this.fakeSet.listNetworkSecurityPerimeterConfigurations(
                accountResouceId
            );
        return result;
    }
}
