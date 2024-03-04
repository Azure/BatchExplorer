import { BasicBatchFakeSet, BatchFakeSet } from "../test-util/fakes";
import { SupportedSku, SupportedSkuType } from "./sku-models";
import { ListSkusOptions, SkuService } from "./sku-service";

export class FakeSkuService implements SkuService {
    fakeSet: BatchFakeSet = new BasicBatchFakeSet();

    setFakes(fakeSet: BatchFakeSet): void {
        this.fakeSet = fakeSet;
    }

    async list(options: ListSkusOptions): Promise<SupportedSku[]> {
        const { type = SupportedSkuType.VirtualMachine, locationName } =
            options;
        return this.fakeSet.listSupportedSkus(type, locationName);
    }
}
