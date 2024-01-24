import { parseBatchAccountIdInfo, parsePoolArmIdInfo } from "../utils";

describe("parse arm id", () => {
    it("should parse a valid arm id", () => {
        const batchAccountId =
            "/subscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba";

        const poolArmId =
            "/subscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba/pools/pool";

        const result1 = parseBatchAccountIdInfo(batchAccountId);
        expect(result1).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
        });

        const result2 = parsePoolArmIdInfo(poolArmId);
        expect(result2).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
            poolName: "pool",
        });
    });

    it("should parse a valid absolute url", () => {
        const batchAccountId =
            "https://example.com/subscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba";

        const poolArmId =
            "https://example.com/subscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba/pools/pool";

        const result1 = parseBatchAccountIdInfo(batchAccountId);
        expect(result1).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
        });

        const result2 = parsePoolArmIdInfo(poolArmId);
        expect(result2).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
            poolName: "pool",
        });
    });

    it("should parse with case-insensitive", () => {
        const batchAccountId =
            "/SuBscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba";

        const poolArmId =
            "/SuBscriptions/123/resourceGroups/rg/providers/Microsoft.Batch/batchAccounts/ba/pools/pool";
        const result1 = parseBatchAccountIdInfo(batchAccountId);
        expect(result1).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
        });

        const result2 = parsePoolArmIdInfo(poolArmId);
        expect(result2).toEqual({
            subscriptionId: "123",
            resourceGroupName: "rg",
            batchAccountName: "ba",
            poolName: "pool",
        });
    });

    it("should throw an error for an invalid batch account id", () => {
        const batchAccountId = "/invalid/batch/account/id";
        expect(() => parseBatchAccountIdInfo(batchAccountId)).toThrowError(
            "Unable to parse batch account id: /invalid/batch/account/id"
        );

        const poolArmId = "/invalid/pool/arm/id";
        expect(() => parsePoolArmIdInfo(poolArmId)).toThrowError(
            "Unable to parse pool ARM id: /invalid/pool/arm/id"
        );
    });
});
