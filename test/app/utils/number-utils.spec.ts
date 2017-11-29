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

    describe("#ordinal", () => {
        it("works for 1st", () => {
            expect(NumberUtils.ordinal(1)).toBe("st");
            expect(NumberUtils.ordinal(21)).toBe("st");
            expect(NumberUtils.ordinal(31)).toBe("st");
            expect(NumberUtils.ordinal(101)).toBe("st");
        });

        it("works for 2nd", () => {
            expect(NumberUtils.ordinal(2)).toBe("nd");
            expect(NumberUtils.ordinal(22)).toBe("nd");
            expect(NumberUtils.ordinal(32)).toBe("nd");
            expect(NumberUtils.ordinal(102)).toBe("nd");
        });

        it("works for 3rd", () => {
            expect(NumberUtils.ordinal(3)).toBe("rd");
            expect(NumberUtils.ordinal(23)).toBe("rd");
            expect(NumberUtils.ordinal(33)).toBe("rd");
            expect(NumberUtils.ordinal(103)).toBe("rd");
        });

        it("works for 11-13 is th", () => {
            expect(NumberUtils.ordinal(11)).toBe("th");
            expect(NumberUtils.ordinal(12)).toBe("th");
            expect(NumberUtils.ordinal(13)).toBe("th");
            expect(NumberUtils.ordinal(111)).toBe("th");
            expect(NumberUtils.ordinal(10013)).toBe("th");
        });

        it("everything else is th", () => {
            expect(NumberUtils.ordinal(4)).toBe("th");
            expect(NumberUtils.ordinal(25)).toBe("th");
            expect(NumberUtils.ordinal(36)).toBe("th");
            expect(NumberUtils.ordinal(107)).toBe("th");
            expect(NumberUtils.ordinal(39949)).toBe("th");
        });
    });

    it("#magnitudeExponent get the right magnitude", () => {
        expect(NumberUtils.magnitudeExponent(5)).toBe(0);
        expect(NumberUtils.magnitudeExponent(1859)).toBe(1);
        expect(NumberUtils.magnitudeExponent(49599473)).toBe(2);
        expect(NumberUtils.magnitudeExponent(933948854949)).toBe(3);
    });

    describe("#prettyMagnitude", () => {
        it("add the right magnitude unit", () => {
            expect(NumberUtils.prettyMagnitude(5)).toBe("5");
            expect(NumberUtils.prettyMagnitude(1859)).toBe("1.86 k");
            expect(NumberUtils.prettyMagnitude(49599473)).toBe("49.6 M");
            expect(NumberUtils.prettyMagnitude(933948854949)).toBe("934 G");
        });

        it("add the suffix at the end unit", () => {
            expect(NumberUtils.prettyMagnitude(5, "Bps")).toBe("5 Bps");
            expect(NumberUtils.prettyMagnitude(1859, "B")).toBe("1.86 kB");
            expect(NumberUtils.prettyMagnitude(49599473, "iB")).toBe("49.6 MiB");
        });
    });
});
