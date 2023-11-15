import { parseBatchAccountIdInfo } from "../utils";

describe("parseBatchAccountIdInfo", () => {
    it("should parse a valid batch account id", () => {
        const batchAccountId =
            "/subscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba";
        const result = parseBatchAccountIdInfo(batchAccountId);
        expect(result).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
        });
    });

    it("should parse a valid absolute url", () => {
        const batchAccountId =
            "https://example.com/subscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba";
        const result = parseBatchAccountIdInfo(batchAccountId);
        expect(result).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
        });
    });

    it("should parse with case-insensitive", () => {
        const batchAccountId =
            "/SuBscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba";
        const result = parseBatchAccountIdInfo(batchAccountId);
        expect(result).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
        });
    });

    it("should throw an error for an invalid batch account id", () => {
        const batchAccountId = "/invalid/batch/account/id";
        expect(() => parseBatchAccountIdInfo(batchAccountId)).toThrowError(
            "Unable to parse batch account id: /invalid/batch/account/id"
        );
    });
});
