import { NumberUtils } from "app/utils";

describe("NumberUtils", () => {
    it("#pretty should put , between thousands", () => {
        expect(NumberUtils.pretty(123)).toEqual("123");
        expect(NumberUtils.pretty(1234)).toEqual("1,234");
        expect(NumberUtils.pretty(1234.09)).toEqual("1,234.09");
        expect(NumberUtils.pretty(1234.1)).toEqual("1,234.10");
        expect(NumberUtils.pretty(123456789)).toEqual("123,456,789");
        expect(NumberUtils.pretty(1234.1455233, 4)).toEqual("1,234.1455");
    });
});
