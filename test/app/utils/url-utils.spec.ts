import { UrlUtils } from "app/utils";

describe("UrlUtils", () => {
    it("parseParams correctly", () => {
        expect(UrlUtils.parseParams("param1=val1&param2=val2")).toEqual({
            param1: "val1",
            param2: "val2",
        });
    });
});
