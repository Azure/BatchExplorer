import { initMockEnvironment } from "../../environment";
import { fromIso, getClock } from "../datetime-util";
import { FakeClock } from "../fake-clock";

describe("Fake clock", () => {
    beforeEach(() => initMockEnvironment());

    test("Can manipulate fake clock", () => {
        const clock = getClock() as FakeClock;

        // Hard-coded current time
        expect(clock.now().getTime()).toEqual(
            fromIso("2022-02-02T00:00:00Z").getTime()
        );

        // Advance 60 seconds
        clock.advance(60_000);
        expect(clock.now().getTime()).toEqual(
            fromIso("2022-02-02T00:01:00Z").getTime()
        );

        // Set time to 2011-01-01 00:00:00 UTC
        clock.setTime(1293840000000);
        expect(clock.now().getTime()).toEqual(
            fromIso("2011-01-01T00:00:00Z").getTime()
        );
    });
});
