import { BatchExplorerLink } from "./batch-explorer-link";

describe("BatchExplorerLink", () => {
    const prefix = "ms-batch-explorer://route/pools/pool-1";

    it("throws an error when invalid protocol", () => {
        expect(() => new BatchExplorerLink("https://invalid")).toThrow();
    });

    it("extract the session from the link", () => {
        expect(new BatchExplorerLink(`ms-batch-explorer://?session=session-1`).session).toEqual("session-1");
        expect(new BatchExplorerLink(`${prefix}?session=session-1`).session).toEqual("session-1");
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1&session=session-1`).session).toEqual("session-1");
    });

    it("extract the accountId from the link", () => {
        expect(new BatchExplorerLink(`ms-batch-explorer://?accountId=account-1`).accountId).toEqual("account-1");
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1`).accountId).toEqual("account-1");
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1&session=session-1`).accountId).toEqual("account-1");
    });

    it("extract other query params", () => {
        expect(new BatchExplorerLink(`ms-batch-explorer://?custom=value-1`).queryParams.get("custom")).toEqual("value-1");
        expect(new BatchExplorerLink(`${prefix}?custom=value-1&accountId=account-1`).queryParams.get("custom"))
            .toEqual("value-1");
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1&custom=value-1&session=session-1`)
            .queryParams.get("custom")).toEqual("value-1");
    });

    it("convert back to the same string", () => {
        expect(new BatchExplorerLink(`ms-batch-explorer://?accountId=account-1`).toString())
            .toEqual(`ms-batch-explorer://?accountId=account-1`);
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1`).toString())
            .toEqual(`${prefix}?accountId=account-1`);
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1&session=session-1`).toString())
            .toEqual(`${prefix}?accountId=account-1&session=session-1`);
        expect(new BatchExplorerLink(`${prefix}?accountId=account-1&custom=value-1&session=session-1`).toString())
            .toEqual(`${prefix}?custom=value-1&accountId=account-1&session=session-1`);

    });

    it("is compatible with ms-batchlabs://", () => {
        expect(new BatchExplorerLink(`ms-batchlabs://?accountId=account-1`).toString())
            .toEqual(`ms-batch-explorer://?accountId=account-1`);
    });
});
