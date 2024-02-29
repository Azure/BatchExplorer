import { Localizer, getLocalizer } from "@azure/bonito-core/lib/localization";
import { initMockBatchEnvironment } from "../../environment";
import {
    BasicBatchFakeSet,
    BatchFakeSet,
    FakeLocations,
} from "../../test-util/fakes";
import { FakeSkuService } from "../fake-sku-service";
import { SupportedSkuType } from "../sku-models";
import { endOfLifeStatus } from "../sku-util";

describe("SKU Utilities", () => {
    let fakeSet: BatchFakeSet;
    let service: FakeSkuService;
    let localizer: Localizer;

    const options = {
        subscriptionId: "00000000-0000-0000-0000-000000000000",
        type: SupportedSkuType.VirtualMachine,
        locationName: FakeLocations.Arrakis.name,
    };

    beforeEach(() => {
        initMockBatchEnvironment();
        fakeSet = new BasicBatchFakeSet();
        service = new FakeSkuService();
        service.setFakes(fakeSet);
        localizer = getLocalizer();
        jest.spyOn(localizer, "getLocale").mockReturnValue("en-US");
    });

    test("returns an EOL date for a given SKU", async () => {
        const eolSku = "Standard_NC8as_T4_v3";
        const nonEolSku = "Standard_NC64as_T4_v3";
        const nonExistingSku = "non-SKU";

        const eol = (skuName: string) =>
            endOfLifeStatus({ ...options, skuName });

        expect(await eol(eolSku)).toEqual({
            eolDate: new Date(2024, 7, 31),
            warning: "This SKU is scheduled for retirement on August 31, 2024",
        });
        expect(await eol(nonEolSku)).toBeNull();
        expect(eol(nonExistingSku)).rejects.toThrow(`SKU 'non-SKU' not found`);
    });
});
