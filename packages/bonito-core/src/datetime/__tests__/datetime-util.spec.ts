import { DateTime } from "luxon";
import {
    formatDateTime,
    fromIso,
    isDate,
    toIsoLocal,
    toIsoUtc,
} from "../datetime-util";
import { initMockEnvironment } from "../../environment";
import { getLocalizer } from "../../localization";
import { FakeLocalizer } from "../../localization/fake-localizer";

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

    test("isDate() function", () => {
        expect(isDate(new Date())).toBeTruthy();

        expect(isDate("2020-12-03T00:12:00.000Z")).toBeFalsy();
        expect(isDate(fromIso("2020-12-03T00:12:00.000Z"))).toBeTruthy();

        // Luxon DateTime != Date
        expect(
            isDate(DateTime.fromISO("2020-12-03T00:12:00.000Z"))
        ).toBeFalsy();
    });

    test("formatDateTime() function", () => {
        // Time zone for testing purposes defaults to -3 offset, so this
        // should be 9PM on January 2nd in the local timezone
        const date = new Date(Date.parse("03 Jan 2020 00:00:00 UTC"));

        expect(formatDateTime(date, DateTime.DATE_SHORT)).toEqual("1/2/2020");
        expect(formatDateTime(date, DateTime.TIME_SIMPLE)).toEqual("9:00 PM");
        expect(formatDateTime(date, DateTime.DATETIME_FULL)).toEqual(
            "January 2, 2020 at 9:00 PM GMT-3"
        );

        // Switching locale should switch format strings
        (getLocalizer() as FakeLocalizer).setLocale("fr");

        expect(formatDateTime(date, DateTime.DATE_SHORT)).toEqual("02/01/2020");
        expect(formatDateTime(date, DateTime.TIME_SIMPLE)).toEqual("21:00");
        expect(formatDateTime(date, DateTime.DATETIME_FULL)).toEqual(
            "2 janvier 2020 à 21:00 UTC−3"
        );
    });
});
