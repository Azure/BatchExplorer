import { fromIso, toIsoLocal, toIsoUtc } from "../datetime";
import { initMockEnvironment } from "../environment";

describe("Date/time utilities", () => {
    beforeEach(() => initMockEnvironment());

    test("fromIso() function", () => {
        expect(fromIso("2020-12-03T00:12:00Z")).toEqual(
            new Date(Date.parse("03 Dec 2020 00:12:00 UTC"))
        );
        expect(fromIso("2020-12-03T00:12:00.000-05:00")).toEqual(
            new Date(Date.parse("03 Dec 2020 00:12:00 EST"))
        );
    });

    test("toIsoLocal() function", () => {
        expect(
            toIsoLocal(new Date(Date.parse("03 Dec 2020 00:12:00 UTC")))
        ).toEqual("2020-12-02T21:12:00.000-03:00");
        expect(
            toIsoLocal(new Date(Date.parse("03 Dec 2020 00:12:00 EST")))
        ).toEqual("2020-12-03T02:12:00.000-03:00");
    });

    test("toIsoUtc() function", () => {
        expect(
            toIsoUtc(new Date(Date.parse("03 Dec 2020 00:12:00 UTC")))
        ).toEqual("2020-12-03T00:12:00.000Z");
        expect(
            toIsoUtc(new Date(Date.parse("03 Dec 2020 00:12:00 EST")))
        ).toEqual("2020-12-03T05:12:00.000Z");
    });
});
