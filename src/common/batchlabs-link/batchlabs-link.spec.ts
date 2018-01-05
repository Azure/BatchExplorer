import { BatchLabsLink } from "./batchlabs-link";

describe("BatchLabsLink", () => {
    const prefix = "ms-batchlabs://route/pools/pool-1";

    it("throws an error when invalid protocol", () => {
        expect(() => new BatchLabsLink("https://invalid")).toThrow();
    });

    it("extract the session from the link", () => {
        expect(new BatchLabsLink(`ms-batchlabs://?session=session-1`).session).toEqual("session-1");
        expect(new BatchLabsLink(`${prefix}?session=session-1`).session).toEqual("session-1");
        expect(new BatchLabsLink(`${prefix}?accountId=account-1&session=session-1`).session).toEqual("session-1");
    });

    it("extract the accountId from the link", () => {
        expect(new BatchLabsLink(`ms-batchlabs://?accountId=account-1`).accountId).toEqual("account-1");
        expect(new BatchLabsLink(`${prefix}?accountId=account-1`).accountId).toEqual("account-1");
        expect(new BatchLabsLink(`${prefix}?accountId=account-1&session=session-1`).accountId).toEqual("account-1");
    });

    it("extract other query params", () => {
        expect(new BatchLabsLink(`ms-batchlabs://?custom=value-1`).queryParams.get("custom")).toEqual("value-1");
        expect(new BatchLabsLink(`${prefix}?custom=value-1&accountId=account-1`).queryParams.get("custom"))
            .toEqual("value-1");
        expect(new BatchLabsLink(`${prefix}?accountId=account-1&custom=value-1&session=session-1`)
            .queryParams.get("custom")).toEqual("value-1");
    });

    it("convert back to the same string", () => {
        expect(new BatchLabsLink(`ms-batchlabs://?accountId=account-1`).toString())
            .toEqual(`ms-batchlabs://?accountId=account-1`);
        expect(new BatchLabsLink(`${prefix}?accountId=account-1`).toString())
            .toEqual(`${prefix}?accountId=account-1`);
        expect(new BatchLabsLink(`${prefix}?accountId=account-1&session=session-1`).toString())
            .toEqual(`${prefix}?accountId=account-1&session=session-1`);
        expect(new BatchLabsLink(`${prefix}?accountId=account-1&custom=value-1&session=session-1`).toString())
            .toEqual(`${prefix}?custom=value-1&accountId=account-1&session=session-1`);

    });
});
